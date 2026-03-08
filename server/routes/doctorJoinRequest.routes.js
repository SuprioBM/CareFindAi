import express from "express";
import {
  createDoctorJoinRequest,
  getAllDoctorJoinRequests,
  getDoctorJoinRequestById,
  reviewDoctorJoinRequest,
} from "../controllers/doctorJoinRequest.controller.js";

const router = express.Router();

router.post("/", createDoctorJoinRequest);
router.get("/", getAllDoctorJoinRequests);
router.get("/:id", getDoctorJoinRequestById);
router.patch("/:id/review", reviewDoctorJoinRequest);

export default router;