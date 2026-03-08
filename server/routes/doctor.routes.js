import express from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getNearbyDoctors,
} from "../controllers/doctor.controller.js";

const router = express.Router();

router.post("/", createDoctor);
router.get("/", getAllDoctors);
router.get("/nearby/search", getNearbyDoctors);
router.get("/:id", getDoctorById);
router.patch("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;