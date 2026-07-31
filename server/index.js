import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { startPrescriptionWorker } from "./workers/prescription.worker.js";

const PORT = process.env.PORT || 5000;

connectDB();
await connectRedis();
startPrescriptionWorker();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
