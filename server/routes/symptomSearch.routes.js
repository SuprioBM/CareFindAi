/**
 * User shall view their previous symptom searches along with the AI-recommended specialists.
 *
 * This file defines the API routes (URL endpoints) for symptom search history.
 * All routes here are PRIVATE — meaning only logged-in users can access them.
 * The `protect` middleware checks the user's JWT token before allowing access.
 *
 * Base path: /api/symptom-searches (mounted in apiRoutes.js)
 *
 * Available routes:
 *   POST   /          → Save a new symptom analysis result to the user's history
 *   GET    /          → Get the complete symptom search history of the logged-in user
 *   GET    /:id       → Get the full details of a single specific past search
 *   DELETE /:id       → Remove a specific past search from history
 */

// Import express to create router
import express from "express";

// Import controller functions (these contain the actual business logic for each route)
import {
  createSymptomSearch,     // Saves a new AI analysis result to the user's history
  getMySymptomSearches,    // Fetches the full search history list for the logged-in user
  getSymptomSearchById,    // Fetches details of one specific past search by its ID
  deleteSymptomSearch,     // Deletes a specific search record from history
} from "../controllers/symptomSearch.controller.js";

// Import authentication middleware — ensures only logged-in users can access these routes.
// "protect" reads the JWT token from the request header and sets req.user if valid.
import { protect } from "../middleware/authMiddleware.js";

// Create a new Express Router instance (this groups all symptom-search-related routes together)
const router = express.Router();

/**
 * Route: Save a new symptom search result
 *
 * POST /api/symptom-searches
 * Access: Private (logged-in users only)
 *
 * Called after the AI finishes analyzing symptoms.
 * The result (specialist, urgency, explanation) is sent here to be permanently saved,
 * so the user can review it later from their "Previous Searches" history page.
 */
router.post("/", protect, createSymptomSearch);

/**
 * Route: Get all previous symptom searches for the logged-in user
 *
 * GET /api/symptom-searches
 * Access: Private
 *
 * Powers the "Previous Searches" page in the user dashboard.
 * Returns a sorted list of all past AI analyses the user has ever made.
 */
router.get("/", protect, getMySymptomSearches);

/**
 * Route: Get details of a single specific past symptom search
 *
 * GET /api/symptom-searches/:id
 * Access: Private
 *
 * Called when the user clicks on a specific item in their history list.
 * Returns the full AI analysis result (reason, matched symptoms, urgency, etc.)
 * for that particular search session.
 */
router.get("/:id", protect, getSymptomSearchById);

/**
 * Route: Delete a past symptom search from history
 *
 * DELETE /api/symptom-searches/:id
 * Access: Private
 *
 * Called when the user removes a specific search from their history.
 * The record is permanently deleted from the database.
 */
router.delete("/:id", protect, deleteSymptomSearch);

// Export the router so it can be registered in the main API routes file (apiRoutes.js)
export default router;