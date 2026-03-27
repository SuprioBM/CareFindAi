// Import express to create router
import express from "express";

// Import controller functions (these contain the actual logic)
import {
  createSymptomSearch,     // Handles creating a new symptom search
  getMySymptomSearches,    // Fetch all searches for logged-in user
  getSymptomSearchById,    // Fetch a single search by ID
  deleteSymptomSearch,     // Delete a search by ID
} from "../controllers/symptomSearch.controller.js";

// Import authentication middleware
import { protect } from "../middleware/authMiddleware.js";

// Create a new router instance
const router = express.Router();

/**
 * Route: POST /
 * Description: Create a new symptom search
 * Access: Private (only logged-in users)
 */
router.post("/", protect, createSymptomSearch);

/**
 * Route: GET /
 * Description: Get all symptom searches of the logged-in user
 * Access: Private
 */
router.get("/", protect, getMySymptomSearches);

/**
 * Route: GET /:id
 * Description: Get a specific symptom search by its ID
 * Access: Private
 */
router.get("/:id", protect, getSymptomSearchById);

/**
 * Route: DELETE /:id
 * Description: Delete a specific symptom search by its ID
 * Access: Private
 */
router.delete("/:id", protect, deleteSymptomSearch);

// Export router to use in main server file (e.g., app.js)
export default router;