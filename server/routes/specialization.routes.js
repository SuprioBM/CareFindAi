/**
 * Specialization Routes
 * 
 * Defines all API endpoints for specialization management.
 * All routes are protected with authentication and admin authorization (except GET by ID).
 * 
 * Base URL: /api/specializations
 */

import express from "express";
import {
  createSpecialization,
  getAllSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
} from "../controllers/specialization.controller.js";
import { requireAdmin } from "../middleware/authGuards.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/specializations
 * Create a new specialization
 * 
 * Middleware: protect (authentication required), requireAdmin (admin role required)
 * 
 * Request Body:
 * {
 *   "name": "Cardiology",
 *   "slug": "cardiology",
 *   "description": "Heart and cardiovascular system specialists",
 *   "icon": "favorite",
 *   "isActive": true
 * }
 * 
 * Response: 201 Created with specialization object and doctorCount: 0
 */
router.post("/", protect, requireAdmin, createSpecialization);

/**
 * GET /api/specializations
 * Retrieve all specializations with doctor counts
 * 
 * Middleware: protect (authentication required), requireAdmin (admin role required)
 * 
 * Query Parameters: None
 * 
 * Response: 200 OK with array of all specializations including doctorCount field
 */
router.get("/", protect, getAllSpecializations);

/**
 * GET /api/specializations/:id
 * Retrieve a specific specialization by ID
 * 
 * Middleware: None (public endpoint, no authentication required)
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the specialization
 * 
 * Response: 200 OK with specialization object, or 404 if not found
 */
router.get("/:id", getSpecializationById);

/**
 * PATCH /api/specializations/:id
 * Update a specialization
 * 
 * Middleware: protect (authentication required), requireAdmin (admin role required)
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the specialization
 * 
 * Request Body: Partial object with fields to update
 * {
 *   "name": "Updated Name",
 *   "description": "Updated description",
 *   "isActive": false
 * }
 * 
 * Response: 200 OK with updated specialization object, or 404 if not found
 */
router.patch("/:id", protect, requireAdmin, updateSpecialization);

/**
 * DELETE /api/specializations/:id
 * Delete a specialization
 * 
 * Middleware: protect (authentication required), requireAdmin (admin role required)
 * 
 * URL Parameters:
 * - id: MongoDB ObjectId of the specialization to delete
 * 
 * Response: 200 OK with success message, or 404 if not found
 */
router.delete("/:id", protect, requireAdmin, deleteSpecialization);

/**
 * Export the router for use in the main Express application
 * Mount at: /api/specializations
 */
export default router;