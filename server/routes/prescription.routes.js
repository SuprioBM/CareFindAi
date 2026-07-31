import express from "express";
import { 
  analyzePrescription, 
  getJobStatus, 
  getUnseenJobs, 
  markJobAsViewed, 
  getJobHistory 
} from "../controllers/prescription.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth protection to all prescription endpoints
router.use(protect);

router.post("/analyze", analyzePrescription);
router.get("/unseen", getUnseenJobs);
router.get("/history", getJobHistory);
router.get("/job/:jobId/status", getJobStatus);
router.post("/:jobId/viewed", markJobAsViewed);

export default router;
