import dotenv from "dotenv";
dotenv.config();

import { makeMockRedis } from "./__mocks__/redisClient";

const mockRedis = makeMockRedis();


jest.unstable_mockModule("../config/redis.js", () => ({
  connectRedis: async () => null,
  disconnectRedis: async () => null,
  getRedis: () => mockRedis,
  default: () => mockRedis, // for compatibility if you still import default anywhere
}));

export { mockRedis };
