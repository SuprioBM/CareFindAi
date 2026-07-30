import { jest } from "@jest/globals";
import request from "supertest";
import { makeMockRedis } from "./__mocks__/redisClient.js";
import {
  connectTestMongo,
  clearTestMongo,
  closeTestMongo,
} from "./mongo.setup.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

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

// Mock AI retrieval context
jest.unstable_mockModule("../modules/ai/ai.retrieval.js", () => ({
  queryMedicalContext: jest.fn(async () => []),
  buildContextText: jest.fn(() => ""),
}));

const { default: app } = await import("../app.js");

describe("CareFind V3 Triage Controller Integration", () => {
  let token;
  let testUser;

  beforeAll(async () => {
    await connectTestMongo();
    
    // Create a mock user and sign JWT
    testUser = await User.create({
      name: "Triage Test User",
      email: "triage-test@test.com",
      password: "hashedPassword123",
      emailVerified: true
    });

    token = jwt.sign(
      { id: testUser._id.toString(), email: testUser.email },
      process.env.JWT_SECRET || "test-jwt-secret",
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await clearTestMongo();
    await closeTestMongo();
  });

  test("Should start and progress triage session successfully in MongoDB", async () => {
    const sessionId = `test-session-${Date.now()}`;

    // 1. Call start endpoint
    const startRes = await request(app)
      .post("/api/v1/triage/start")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sessionId,
        message: "I have a headache",
        age: 24,
        gender: "male",
        duration: "1_day"
      });

    console.log("Start Response Body:", startRes.body);
    expect(startRes.statusCode).toBe(200);
    expect(startRes.body.success).toBe(true);
    expect(startRes.body.sessionId).toBe(sessionId);
    expect(startRes.body.nextQuestion).toBeDefined();

    // 2. Call message endpoint to continue triage
    const messageRes = await request(app)
      .post("/api/v1/triage/message")
      .set("Authorization", `Bearer ${token}`)
      .send({
        sessionId,
        message: "Yes"
      });

    console.log("Message Response Body:", messageRes.body);
    expect(messageRes.statusCode).toBe(200);
    expect(messageRes.body.success).toBe(true);
  });
});
