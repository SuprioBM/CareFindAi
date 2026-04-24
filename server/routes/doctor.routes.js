/**
 * Doctor Routes
 *
 * The system shall allow users to view detailed doctor profiles,
 *        including specialization, chamber information, and contact details from the dashboard.
 *
 * This file defines all API routes (URL endpoints) for doctor-related operations.
 * Some routes are public (no login required), and some are restricted to admins.
 *
 * Base path: /api/doctors (mounted in apiRoutes.js)
 *
 * Route summary:
 *   POST   /                → [Admin] Create a new doctor profile
 *   GET    /                → [Admin] List all doctors with optional filters
 *   GET    /manual/search   → [Public] Search doctors by name, specialty, city, fees, etc.
 *   GET    /nearby/search   → [Public] Find doctors near a GPS location
 *   GET    /:id             → [Private] Get the FULL profile of a single doctor ()
 *   PATCH  /:id             → [Admin] Update a doctor's profile information
 *   DELETE /:id             → [Admin] Delete a doctor profile permanently
 *
 * Note: /manual/search and /nearby/search MUST be registered BEFORE /:id
 *       because Express matches routes in order — if /:id comes first,
 *       "manual" and "nearby" would be treated as doctor IDs, causing errors.
 */

import express from "express";
import {
  createDoctor,      // [Admin] Add a new doctor profile
  getAllDoctors,      // [Admin] List all doctors with filters
  getDoctorById,     // [] Get a single doctor's full profile (name, specialty, chamber, contacts)
  updateDoctor,      // [Admin] Edit an existing doctor profile
  deleteDoctor,      // [Admin] Permanently remove a doctor profile
  getNearbyDoctors,  // [Public] Find doctors near the user's GPS location
  manualSearch,      // [Public] Search doctors by text/category filters
} from "../controllers/doctor.controller.js";

// protect → checks JWT token, ensures user is logged in
import { protect } from "../middleware/authMiddleware.js";

// requireAdmin → additional check after protect, ensures the user has admin role
import { requireAdmin } from "../middleware/authGuards.js";

const router = express.Router();

// ── Admin-only Routes ─────────────────────────────────────────────────────────

// POST /api/doctors
// Creates a new doctor profile. Only admins can add doctors to the system.
router.post("/", protect, requireAdmin, createDoctor);

// GET /api/doctors
// Lists all doctors. Only admins can see the full unfiltered list (including inactive/unapproved ones).
router.get("/", protect, requireAdmin, getAllDoctors);

// ── Public Search Routes ──────────────────────────────────────────────────────
// These routes are PUBLIC — no login needed. Patients can search for doctors freely.

// GET /api/doctors/manual/search?specialization=&city=&fullName=&fees=&...
// Flexible text-based doctor search with multiple optional filters.
// Must be registered BEFORE /:id to avoid being treated as an ID route.
router.get("/manual/search", manualSearch);

// GET /api/doctors/nearby/search?latitude=&longitude=&radius=&specialization=
// Finds doctors near a given GPS location within a specified radius (default 20km).
// Must be registered BEFORE /:id to avoid route conflict.
router.get("/nearby/search", getNearbyDoctors);

// ── Profile View Route () ────────────────────────────────────────────────

// GET /api/doctors/:id
// Fetch the complete, detailed profile of a single doctor.
// This powers the "Doctor Profile" page — showing the user:
//   • Name, qualifications, specialization, and profile photo
//   • Chamber address (hospitalOrClinic + chamberAddress + area + city)
//   • Contact details (appointmentPhone, appointmentWebsite)
//   • Fees, off-days, consultation type, and bio
// Requires login (protect) to prevent anonymous data scraping.
router.get("/:id", protect, getDoctorById);

// ── Admin Management Routes ───────────────────────────────────────────────────

// PATCH /api/doctors/:id → Update doctor info (admin can correct any field)
router.patch("/:id", protect, requireAdmin, updateDoctor);

// DELETE /api/doctors/:id → Remove a doctor profile permanently
router.delete("/:id", protect, requireAdmin, deleteDoctor);

export default router;