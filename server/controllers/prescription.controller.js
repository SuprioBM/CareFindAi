import crypto from "crypto";
import { prescriptionQueue } from "../config/queue.js";
import PrescriptionJob from "../models/prescriptionJob.model.js";
import { PrescriptionService } from "../services/prescription.service.js";

const prescriptionService = new PrescriptionService();

// POST /api/analyze-prescription (also under /api/v1/prescription/analyze)
export const analyzePrescription = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "image (base64 string or data URI) is required."
      });
    }

    // Verify user is present from auth middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const jobId = `job_${crypto.randomUUID()}`;

    // Test or local development bypass when Redis/Queue is not active
    if (!prescriptionQueue) {
      console.log(`[Prescription Controller] Queue not initialized (test/fallback). Processing job ${jobId} synchronously...`);
      
      const jobRecord = await PrescriptionJob.create({
        jobId,
        userId: req.user.id,
        status: "processing"
      });

      try {
        const result = await prescriptionService.analyze(image);
        jobRecord.status = "completed";
        jobRecord.result = result;
        jobRecord.completedAt = new Date();
        await jobRecord.save();
        
        return res.json({
          success: true,
          jobId,
          status: "completed",
          result
        });
      } catch (err) {
        jobRecord.status = "failed";
        jobRecord.error = err.message;
        await jobRecord.save();

        return res.status(500).json({
          success: false,
          jobId,
          status: "failed",
          error: err.message
        });
      }
    }

    // Production queue flow: Add job to BullMQ
    console.log(`[Prescription Controller] Pushing job ${jobId} (User: ${req.user.id}) to BullMQ...`);
    
    await PrescriptionJob.create({
      jobId,
      userId: req.user.id,
      status: "pending"
    });

    await prescriptionQueue.add(
      "analyze-prescription",
      { jobId, image },
      { jobId } // Use jobId as BullMQ unique ID
    );

    return res.json({
      success: true,
      jobId,
      status: "pending"
    });

  } catch (error) {
    console.error("analyzePrescription controller error:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Failed to queue prescription analysis.",
      error: error.message
    });
  }
};

// GET /api/prescription/job/:jobId/status (also under /api/v1/prescription/job/:jobId/status)
export const getJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Security: Only return jobs belonging to the authenticated user
    const job = await PrescriptionJob.findOne({ jobId, userId: req.user.id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job ${jobId} not found or access denied.`
      });
    }

    return res.json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      error: job.error,
      result: job.result
    });

  } catch (error) {
    console.error("getJobStatus controller error:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job status.",
      error: error.message
    });
  }
};

// GET /api/prescriptions/unseen (also under /api/v1/prescription/unseen)
export const getUnseenJobs = async (req, res) => {
  try {
    const jobs = await PrescriptionJob.find({
      userId: req.user.id,
      status: "completed",
      viewedAt: null
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: jobs.length,
      jobs
    });

  } catch (error) {
    console.error("getUnseenJobs controller error:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unseen reports.",
      error: error.message
    });
  }
};

// POST /api/prescriptions/:jobId/viewed (also under /api/v1/prescription/:jobId/viewed)
export const markJobAsViewed = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await PrescriptionJob.findOne({ jobId, userId: req.user.id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job ${jobId} not found or access denied.`
      });
    }

    // Only update viewedAt if it is currently null
    if (job.viewedAt === null) {
      job.viewedAt = new Date();
      await job.save();
    }

    return res.json({
      success: true,
      message: "Report marked as viewed.",
      viewedAt: job.viewedAt
    });

  } catch (error) {
    console.error("markJobAsViewed controller error:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Failed to update viewed state.",
      error: error.message
    });
  }
};

// GET /api/prescriptions/history (also under /api/v1/prescription/history)
export const getJobHistory = async (req, res) => {
  try {
    // Return all jobs for the current user ordered by newest first
    // Exclude large result payloads for efficiency
    const jobs = await PrescriptionJob.find({ userId: req.user.id })
      .select("jobId status error createdAt completedAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      jobs
    });

  } catch (error) {
    console.error("getJobHistory controller error:", error.stack || error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve history.",
      error: error.message
    });
  }
};
