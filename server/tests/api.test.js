import { jest } from "@jest/globals";
import { makeMockRedis } from "./__mocks__/redisClient.js";

const mockRedis = makeMockRedis();

jest.unstable_mockModule("../config/redis.js", () => ({
  connectRedis: async () => null,
  disconnectRedis: async () => null,
  getRedis: () => mockRedis,
  default: () => mockRedis, // if any default import remains
}));

jest.unstable_mockModule("../modules/ai/ai.openRouter.js", () => ({
  generateOpenRouterResponse: jest.fn(),
  default: {},
}));

jest.unstable_mockModule("../modules/ai/ai.retrieval.js", () => ({
  retrieveRelevantDocs: jest.fn(async () => []),
  searchQdrant: jest.fn(async () => []),
  default: {},
}));

const { default: app } = await import("../app.js");
import request from "supertest";

test("GET /api/test returns hello", async () => {
  const res = await request(app).get("/api/test");
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ message: "Hello from Express" });
});
