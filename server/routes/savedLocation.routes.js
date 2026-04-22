/**
 * User shall save frequently used locations, such as home or office,
 *        for quick future searches.
 *
 * This file defines the API routes (URL endpoints) for saved locations.
 * All routes are PRIVATE — the `protect` middleware ensures only logged-in users can access them.
 *
 * Base path: /api/saved-locations (mounted in apiRoutes.js)
 *
 * Available routes:
 *   POST   /          → Save a new location (home, office, or custom)
 *   GET    /          → Get all saved locations for the logged-in user
 *   GET    /:id       → Get details of a single saved location
 *   PATCH  /:id       → Edit/update an existing saved location
 *   DELETE /:id       → Permanently remove a saved location
 */

import express from "express";
import {
  createSavedLocation,    // Saves a new location (e.g., home or office) to the database
  getMySavedLocations,    // Gets the full list of saved locations for the logged-in user
  getSavedLocationById,   // Gets details of one specific saved location by ID
  updateSavedLocation,    // Updates an existing saved location (e.g., change address or label)
  deleteSavedLocation,    // Removes a saved location permanently from the user's list
} from "../controllers/savedLocation.controller.js";

// Auth middleware — all saved-location routes require the user to be logged in.
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/saved-locations → Save a new location (save home, office, etc.)
router.post("/", protect, createSavedLocation);

// GET /api/saved-locations → Get the full list of saved locations (quick future searches)
router.get("/", protect, getMySavedLocations);

// GET /api/saved-locations/:id → Get one specific saved location's full details
router.get("/:id", protect, getSavedLocationById);

// PATCH /api/saved-locations/:id → Edit an existing saved location (update address, label, etc.)
router.patch("/:id", protect, updateSavedLocation);

// DELETE /api/saved-locations/:id → Remove a saved location permanently
router.delete("/:id", protect, deleteSavedLocation);

// Export to be mounted in the main API routes file
export default router;