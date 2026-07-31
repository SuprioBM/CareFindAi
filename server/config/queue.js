import { Queue } from "bullmq";

const redisConnection = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null // Required by BullMQ
};

let prescriptionQueue = null;

if (process.env.NODE_ENV !== "test") {
  try {
    prescriptionQueue = new Queue("prescription-queue", {
      connection: redisConnection
    });
    console.log("PrescriptionQueue: Queue client initialized successfully.");
  } catch (err) {
    console.error("PrescriptionQueue: Failed to initialize queue client:", err);
  }
}

export { prescriptionQueue, redisConnection };
export default prescriptionQueue;
