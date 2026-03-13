import { jest } from "@jest/globals";
import request from "supertest";
import { makeMockRedis } from "./__mocks__/redisClient.js";

import {
  connectTestMongo,
  clearTestMongo,
  closeTestMongo,
} from "./mongo.setup.js";

const mockRedis = makeMockRedis();

/**
 * ✅ Mock Redis module
 */
jest.unstable_mockModule("../config/redis.js", () => ({
  connectRedis: async () => null,
  disconnectRedis: async () => null,
  getRedis: () => mockRedis,
  default: () => mockRedis,
}));

/**
 * ✅ Mock Arcjet middleware so it never blocks tests
 * Your middleware likely exports `arcjetProtect({ requested })`
 * We return a middleware (req,res,next) that always next()
 */
jest.unstable_mockModule("../middleware/arcjetProtect.js", () => ({
  arcjetProtect: () => (req, res, next) => next(),
}));

/**
 * ✅ Mock mail sending (Nodemailer wrapper middleware)
 * We capture codes here so tests can verify OTP flows.
 */
let lastVerifyCode = null;
let lastResetCode = null;

jest.unstable_mockModule("../middleware/sendEmail.js", () => ({
  sendVerificationEmail: async ({ to, code }) => {
    lastVerifyCode = code;
  },
  sendPasswordResetEmail: async ({ to, code }) => {
    lastResetCode = code;
  },
  // optional: in case any file imports default
  default: {
    sendVerificationEmail: async ({ to, code }) => {
      lastVerifyCode = code;
    },
    sendPasswordResetEmail: async ({ to, code }) => {
      lastResetCode = code;
    },
  },
}));

/**
 * Optional:
 * If you implemented Google OAuth controller already and it imports google client,
 * you can mock it here. For now we won’t test Google endpoints in this file.
 */
// jest.unstable_mockModule("../config/googleOAuth.js", () => ({
//   googleClient: { verifyIdToken: async () => ({ getPayload: () => ({}) }) },
//   buildGoogleAuthUrl: (state) => `https://google.test/auth?state=${state}`,
// }));

const { default: app } = await import("../app.js");
const { default: User } = await import("../models/User.model.js");

beforeAll(async () => {
  await connectTestMongo();
});

afterEach(async () => {
  await clearTestMongo();
  mockRedis._clear();
  lastVerifyCode = null;
  lastResetCode = null;
});

afterAll(async () => {
  await closeTestMongo();
});

function getCookie(res, cookieName) {
  const setCookie = res.headers["set-cookie"] || [];
  return setCookie.find((c) => c.startsWith(`${cookieName}=`));
}

async function registerUser({ name, email, password }) {
  return request(app)
    .post("/api/v1/auth/register")
    .send({ name, email, password });
}

async function verifyEmail({ email, code }) {
  return request(app).post("/api/v1/auth/verify-email").send({ email, code });
}

async function loginUser({ email, password, agent }) {
  const r = agent ? agent : request(app);
  return r.post("/api/v1/auth/login").send({ email, password });
}

describe("Auth API (updated)", () => {
  test("POST /api/v1/auth/register -> 201 + sends OTP (no userId now)", async () => {
    const res = await registerUser({
      name: "Suprio",
      email: "suprio@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);

    // New register response you added:
    expect(res.body).toHaveProperty("next", "VERIFY_EMAIL");
    expect(res.body).toHaveProperty("email", "suprio@test.com");

    // Verify code was "emailed" (mocked)
    expect(lastVerifyCode).toBeTruthy();
    expect(String(lastVerifyCode)).toMatch(/^\d{6}$/);

    // DB: user exists but not verified
    const u = await User.findOne({ email: "suprio@test.com" });
    expect(u).toBeTruthy();
    expect(u.emailVerified).toBe(false);
    expect(u.emailVerifyCodeHash).toBeTruthy();
  });

  test("POST /api/v1/auth/login -> blocked until verified (403 EMAIL_NOT_VERIFIED)", async () => {
    await registerUser({
      name: "Login",
      email: "login@test.com",
      password: "123456",
    });

    const res = await loginUser({
      email: "login@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("code", "EMAIL_NOT_VERIFIED");
  });

  test("POST /api/v1/auth/verify-email -> verifies OTP, then login works", async () => {
    await registerUser({
      name: "Me",
      email: "me@test.com",
      password: "123456",
    });

    // We captured OTP via mocked email sender
    expect(lastVerifyCode).toBeTruthy();

    const verifyRes = await verifyEmail({
      email: "me@test.com",
      code: String(lastVerifyCode),
    });

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body).toHaveProperty("message");

    const loginRes = await loginUser({
      email: "me@test.com",
      password: "123456",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
    expect(getCookie(loginRes, "refresh_token")).toBeTruthy();
  });

  test("GET /api/v1/auth/me requires token -> 401", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/v1/auth/me works with Bearer token", async () => {
    await registerUser({
      name: "Me2",
      email: "me2@test.com",
      password: "123456",
    });

    await verifyEmail({
      email: "me2@test.com",
      code: String(lastVerifyCode),
    });

    const loginRes = await loginUser({
      email: "me2@test.com",
      password: "123456",
    });

    const token = loginRes.body.accessToken;

    const meRes = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body).toHaveProperty("email", "me2@test.com");
  });

  test("POST /api/v1/auth/refresh -> returns new accessToken and sets cookie (agent)", async () => {
    const agent = request.agent(app);

    await registerUser({
      name: "Ref",
      email: "ref@test.com",
      password: "123456",
    });

    await verifyEmail({
      email: "ref@test.com",
      code: String(lastVerifyCode),
    });

    const loginRes = await loginUser({
      agent,
      email: "ref@test.com",
      password: "123456",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(getCookie(loginRes, "refresh_token")).toBeTruthy();

    const refreshRes = await agent.post("/api/v1/auth/refresh").send();
    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body).toHaveProperty("accessToken");
    expect(getCookie(refreshRes, "refresh_token")).toBeTruthy();
  });

  test("POST /api/v1/auth/logout -> 200 (agent)", async () => {
    const agent = request.agent(app);

    await registerUser({
      name: "Out",
      email: "out@test.com",
      password: "123456",
    });

    await verifyEmail({
      email: "out@test.com",
      code: String(lastVerifyCode),
    });

    const loginRes = await loginUser({
      agent,
      email: "out@test.com",
      password: "123456",
    });

    expect(loginRes.statusCode).toBe(200);

    const logoutRes = await agent.post("/api/v1/auth/logout").send();
    expect(logoutRes.statusCode).toBe(200);
  });

  test("POST /api/v1/auth/resend-verification -> sends a new OTP", async () => {
    await registerUser({
      name: "Resend",
      email: "resend@test.com",
      password: "123456",
    });

    const firstCode = lastVerifyCode;
    expect(firstCode).toBeTruthy();

    // Resend
    const resendRes = await request(app)
      .post("/api/v1/auth/resend-verification")
      .send({ email: "resend@test.com" });

    expect([200, 429]).toContain(resendRes.statusCode);

    // If cooldown allows, we should see a new code.
    if (resendRes.statusCode === 200) {
      expect(lastVerifyCode).toBeTruthy();
      // could be same by chance, but extremely unlikely; we won't assert not equal.
    }
  });

  test("Password reset flow: forgot-password -> verify-reset-code -> reset-password -> login with new password", async () => {
  const email = "reset@test.com";
  const oldPass = "oldpass123";
  const newPass = "newpass456";

  await registerUser({
    name: "Reset",
    email,
    password: oldPass,
  });

  await verifyEmail({ email, code: String(lastVerifyCode) });

  // 1) Request reset
  const forgotRes = await request(app)
    .post("/api/v1/auth/forgot-password")
    .send({ email });

  expect(forgotRes.statusCode).toBe(200);
  expect(lastResetCode).toBeTruthy();

  // 2) Verify reset code
  const verifyResetRes = await request(app)
    .post("/api/v1/auth/verify-reset-code")
    .send({
      email,
      code: String(lastResetCode),
    });

  expect(verifyResetRes.statusCode).toBe(200);

  // 3) Reset password after code verification
  const resetRes = await request(app)
    .post("/api/v1/auth/reset-password")
    .send({
      email,
      password: newPass,
    });

  expect(resetRes.statusCode).toBe(200);

  // Old password should fail
  const oldLoginRes = await loginUser({ email, password: oldPass });
  expect(oldLoginRes.statusCode).toBe(401);

  // New password should work
  const newLoginRes = await loginUser({ email, password: newPass });
  expect(newLoginRes.statusCode).toBe(200);
  expect(newLoginRes.body).toHaveProperty("accessToken");
  expect(getCookie(newLoginRes, "refresh_token")).toBeTruthy();
});
  test("Session management: GET /sessions + revoke all", async () => {
    const email = "sess@test.com";
    const pass = "123456";

    // Verify+Login
    await registerUser({ name: "Sess", email, password: pass });
    await verifyEmail({ email, code: String(lastVerifyCode) });

    const loginRes = await loginUser({ email, password: pass });
    const token = loginRes.body.accessToken;

    // List sessions
    const listRes = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.statusCode).toBe(200);
    expect(listRes.body).toHaveProperty("sessions");
    expect(Array.isArray(listRes.body.sessions)).toBe(true);

    // Revoke all
    const revokeAllRes = await request(app)
      .delete("/api/v1/auth/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(revokeAllRes.statusCode).toBe(200);
  });
});

test("verify-email fails with wrong OTP", async () => {
  await registerUser({
    name: "Wrong",
    email: "wrong@test.com",
    password: "123456",
  });

  const res = await verifyEmail({
    email: "wrong@test.com",
    code: "000000",
  });

  expect(res.statusCode).toBe(400);
});
