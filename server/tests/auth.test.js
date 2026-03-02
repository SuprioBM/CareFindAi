import { jest } from "@jest/globals";
import { makeMockRedis } from "./__mocks__/redisClient.js";
import request from "supertest";

import {
  connectTestMongo,
  clearTestMongo,
  closeTestMongo,
} from "./mongo.setup.js";

const mockRedis = makeMockRedis();

jest.unstable_mockModule("../config/redis.js", () => ({
  connectRedis: async () => null,
  disconnectRedis: async () => null,
  getRedis: () => mockRedis,
  default: () => mockRedis,
}));

const { default: app } = await import("../app.js");

beforeAll(async () => {
  await connectTestMongo();
});

afterEach(async () => {
  await clearTestMongo();
  mockRedis._clear();
});

afterAll(async () => {
  await closeTestMongo();
});

function getCookie(res, cookieName) {
  const setCookie = res.headers["set-cookie"] || [];
  return setCookie.find((c) => c.startsWith(`${cookieName}=`));
}

describe("Auth API", () => {
  test("POST /api/auth/register -> 201", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Suprio",
      email: "suprio@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId");
  });

  test("POST /api/auth/login -> sets refresh cookie + returns accessToken", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Login",
      email: "login@test.com",
      password: "123456",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@test.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(getCookie(res, "refresh_token")).toBeTruthy();
  });

  test("GET /api/auth/me requires token -> 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/auth/me works with Bearer token", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Me",
      email: "me@test.com",
      password: "123456",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "me@test.com",
      password: "123456",
    });

    const token = loginRes.body.accessToken;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body).toHaveProperty("email", "me@test.com");
  });

  test("POST /api/auth/refresh -> returns new accessToken and sets cookie", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      name: "Ref",
      email: "ref@test.com",
      password: "123456",
    });

    const loginRes = await agent.post("/api/auth/login").send({
      email: "ref@test.com",
      password: "123456",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(getCookie(loginRes, "refresh_token")).toBeTruthy();

    const refreshRes = await agent.post("/api/auth/refresh").send();
    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body).toHaveProperty("accessToken");
    expect(getCookie(refreshRes, "refresh_token")).toBeTruthy();
  });

  test("POST /api/auth/logout -> 200", async () => {
    const agent = request.agent(app);

    await agent.post("/api/auth/register").send({
      name: "Out",
      email: "out@test.com",
      password: "123456",
    });

    const loginRes = await agent.post("/api/auth/login").send({
      email: "out@test.com",
      password: "123456",
    });

    expect(loginRes.statusCode).toBe(200);

    const logoutRes = await agent.post("/api/auth/logout").send();
    expect(logoutRes.statusCode).toBe(200);
  });
});
