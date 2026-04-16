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
  manualSearch,
} from "../controllers/doctor.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/authGuards.js";

const router = express.Router();

// Create a new doctor
router.post("/",protect, requireAdmin, createDoctor);

// Get all doctors
router.get("/",protect,requireAdmin, getAllDoctors);

// Manual Search
router.get("/manual/search", manualSearch);

// Find nearby doctors by location — must be registered before /:id to avoid route conflict
router.get("/nearby/search", getNearbyDoctors);

// Get, update, or delete a specific doctor by ID
router.get("/:id",protect, getDoctorById);
router.patch("/:id",protect, requireAdmin, updateDoctor);
router.delete("/:id",protect, requireAdmin, deleteDoctor);

export default router;