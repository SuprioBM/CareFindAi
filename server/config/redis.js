import { createClient } from "redis";

let redis;

/**
 * Connects to Redis (call this from index.js only, not from app.js/routes).
 * Skips connecting during tests.
 */
export async function connectRedis() {
  if (process.env.NODE_ENV === "test") return null;

  redis = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

  redis.on("connect", () => console.log("Connected to Redis"));
  redis.on("error", (err) => console.log("Redis Client Error", err));

  await redis.connect();
  return redis;
}

/**
 * Get the already-connected client.
 * Use this inside controllers/services after connectRedis() was called.
 */
export function getRedis() {
  if (!redis)
    throw new Error("Redis not connected. Call connectRedis() first.");
  return redis;
}

/**
 * Optional: close redis (useful for graceful shutdown)
 */
export async function disconnectRedis() {
  if (redis) {
    await redis.quit();
    redis = undefined;
  }
}

export default function redisClient() {
  return getRedis();
}
