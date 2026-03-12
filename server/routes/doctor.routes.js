/**
 * Doctor Routes
 *
 * Base path: /api/doctors
 *
 * POST   /             - Create a new doctor record
 * GET    /             - Retrieve all doctors
 * GET    /nearby/search - Find doctors near a given location (query: lat, lng, radius)
 * GET    /:id          - Retrieve a single doctor by ID
 * PATCH  /:id          - Update a doctor's details by ID
 * DELETE /:id          - Delete a doctor by ID
 */

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

// Create a new doctor
router.post("/", createDoctor);

// Get all doctors
router.get("/", getAllDoctors);

// Find nearby doctors by location — must be registered before /:id to avoid route conflict
router.get("/nearby/search", getNearbyDoctors);

// Get, update, or delete a specific doctor by ID
router.get("/:id", getDoctorById);
router.patch("/:id", updateDoctor);
router.delete("/:id", deleteDoctor);

export default router;