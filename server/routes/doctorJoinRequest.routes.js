import express from "express";
import {
  createDoctorJoinRequest,
  getAllDoctorJoinRequests,
  getDoctorJoinRequestById,
  reviewDoctorJoinRequest,
} from "../controllers/doctorJoinRequest.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/authGuards.js";

const router = express.Router();

router.post("/",protect, createDoctorJoinRequest);
router.get("/",protect, requireAdmin, getAllDoctorJoinRequests);
router.get("/:id", protect,getDoctorJoinRequestById);
router.patch("/:id/review", protect, requireAdmin, reviewDoctorJoinRequest);

export default router;