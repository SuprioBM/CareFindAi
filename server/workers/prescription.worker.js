import { Worker } from "bullmq";
import { redisConnection } from "../config/queue.js";
import PrescriptionJob from "../models/prescriptionJob.model.js";
import { PrescriptionService } from "../services/prescription.service.js";

const prescriptionService = new PrescriptionService();

let worker = null;

export function startPrescriptionWorker() {
  if (process.env.NODE_ENV === "test") {
    console.log("PrescriptionWorker: Skipping worker startup in test environment.");
    return null;
  }

  if (worker) {
    return worker;
  }

  console.log("PrescriptionWorker: Starting background worker...");

  worker = new Worker(
    "prescription-queue",
    async (job) => {
      const { jobId, image } = job.data;
      console.log(`[Prescription Worker] Processing Job ${jobId}...`);

      try {
        // Update job status to processing in DB
        await PrescriptionJob.findOneAndUpdate(
          { jobId },
          { status: "processing" }
        );

        // Run the single-call clinical analysis
        const analysisResult = await prescriptionService.analyze(image);

        // Save result and complete job in DB
        await PrescriptionJob.findOneAndUpdate(
          { jobId },
          { 
            status: "completed", 
            result: analysisResult,
            completedAt: new Date()
          }
        );

        console.log(`[Prescription Worker] Job ${jobId} completed successfully.`);
      } catch (err) {
        console.error(`[Prescription Worker] Job ${jobId} failed:`, err);
        
        await PrescriptionJob.findOneAndUpdate(
          { jobId },
          { status: "failed", error: err.message }
        );

        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: 2 // Max parallel jobs per worker thread
    }
  );

  worker.on("completed", (job) => {
    console.log(`[Prescription Worker] Job ${job.id} event: completed`);
  });

  worker.on("failed", (job, err) => {
    console.log(`[Prescription Worker] Job ${job?.id} event: failed: ${err.message}`);
  });

  return worker;
}
