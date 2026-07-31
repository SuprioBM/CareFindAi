import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import { makeMockRedis } from "./__mocks__/redisClient.js";
import {
  connectTestMongo,
  clearTestMongo,
  closeTestMongo,
} from "./mongo.setup.js";
import User from "../models/User.model.js";

const mockRedis = makeMockRedis();

// Mock Redis connection
jest.unstable_mockModule("../config/redis.js", () => ({
  connectRedis: async () => null,
  disconnectRedis: async () => null,
  getRedis: () => mockRedis,
  default: () => mockRedis,
}));

// Mock Arcjet
jest.unstable_mockModule("../middleware/arcjetProtect.js", () => ({
  arcjetProtect: () => (req, res, next) => next(),
}));

const { default: app } = await import("../app.js");

describe("Prescription Analyzer API Integration", () => {
  let token;
  let testUser;

  beforeAll(async () => {
    await connectTestMongo();
    
    // Create a mock user for authenticated queries
    testUser = await User.create({
      name: "Prescription Test User",
      email: `presc-test-${Date.now()}@test.com`,
      password: "password123",
      role: "user",
      isVerified: true
    });

    token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || "DUK10892", {
      expiresIn: "1h",
    });
  });

  afterEach(async () => {
    // Keep user intact so beforeAll setup remains valid
    await clearTestMongo();
    await User.create(testUser.toObject());
  });

  afterAll(async () => {
    await closeTestMongo();
  });

  test("POST /api/analyze-prescription unauthenticated -> 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/analyze-prescription")
      .send({
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      });

    expect(res.statusCode).toBe(401);
  });

  test("POST /api/analyze-prescription with missing image -> 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/analyze-prescription")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("image");
  });

  test("POST /api/analyze-prescription with base64 image -> 200 OK and returns structured lists", async () => {
    const res = await request(app)
      .post("/api/analyze-prescription")
      .set("Authorization", `Bearer ${token}`)
      .send({
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    
    const targetObj = res.body.result || res.body;
    expect(targetObj).toHaveProperty("prescribedMedications");
    expect(targetObj).toHaveProperty("alternativeMedications");

    const meds = targetObj.prescribedMedications;
    expect(meds.length).toBeGreaterThan(0);
    expect(meds[0]).toHaveProperty("medicineName");

    const jobId = res.body.jobId;

    // Check status check endpoint
    const statusRes = await request(app)
      .get(`/api/prescription/job/${jobId}/status`)
      .set("Authorization", `Bearer ${token}`);

    expect(statusRes.statusCode).toBe(200);
    expect(statusRes.body.status).toBe("completed");

    // Check history endpoint
    const historyRes = await request(app)
      .get("/api/prescriptions/history")
      .set("Authorization", `Bearer ${token}`);

    expect(historyRes.statusCode).toBe(200);
    expect(historyRes.body.jobs.length).toBe(1);
    expect(historyRes.body.jobs[0].jobId).toBe(jobId);

    // Check unseen endpoint (should be 1 because viewedAt is null)
    const unseenRes = await request(app)
      .get("/api/prescriptions/unseen")
      .set("Authorization", `Bearer ${token}`);

    expect(unseenRes.statusCode).toBe(200);
    expect(unseenRes.body.count).toBe(1);

    // Mark viewed
    const viewedRes = await request(app)
      .post(`/api/prescriptions/${jobId}/viewed`)
      .set("Authorization", `Bearer ${token}`);

    expect(viewedRes.statusCode).toBe(200);
    expect(viewedRes.body.success).toBe(true);

    // Check unseen endpoint again (should be 0)
    const unseenRes2 = await request(app)
      .get("/api/prescriptions/unseen")
      .set("Authorization", `Bearer ${token}`);

    expect(unseenRes2.statusCode).toBe(200);
    expect(unseenRes2.body.count).toBe(0);
  });
});
