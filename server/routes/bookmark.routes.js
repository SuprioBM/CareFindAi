/**
 * The system shall allow users to save or bookmark doctors for quick future reference.
 *
 * This file defines the API routes (URL endpoints) for the bookmark (saved doctors) feature.
 * All routes in this file are PRIVATE — protected by the `protect` middleware,
 * which verifies the user's login session (JWT token) before allowing any request through.
 *
 * Base path: /api/bookmarks (mounted in apiRoutes.js)
 *
 * Available routes:
 *   POST   /          → Bookmark (save) a doctor to the user's favorites list
 *   GET    /          → Get all bookmarked doctors for the logged-in user
 *   GET    /:id       → Get details of a single specific bookmark
 *   PATCH  /:id       → Update a bookmark (e.g., link/change an associated location)
 *   DELETE /:id       → Remove (unsave) a bookmarked doctor
 */

import express from "express";
import {
  createBookmark,    // Saves a doctor to the user's bookmark/favorites list
  getMyBookmarks,    // Retrieves all saved doctors for the logged-in user
  getBookmarkById,   // Retrieves a single bookmark's details by its ID
  updateBookmark,    // Updates a bookmark (e.g., attach a saved location to it)
  deleteBookmark,    // Removes a doctor from the user's saved list
} from "../controllers/bookmark.controller.js";

// Auth middleware — all bookmark routes require the user to be logged in.
// "protect" reads the JWT from the Authorization header and sets req.user.
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply the "protect" middleware to ALL routes in this router at once.
// This means every request to /api/bookmarks/* requires a valid login session.
router.use(protect);

// POST /api/bookmarks → Save a new doctor bookmark (save for future reference)
router.post("/", createBookmark);

// GET /api/bookmarks → Get the full list of saved/bookmarked doctors (view saved doctors)
router.get("/", getMyBookmarks);

// GET /api/bookmarks/:id → Get one specific bookmark's details
router.get("/:id", getBookmarkById);

// PATCH /api/bookmarks/:id → Update an existing bookmark (e.g., change linked location)
router.patch("/:id", updateBookmark);

// DELETE /api/bookmarks/:id → Remove a doctor from saved list (unsave/unfavorite)
router.delete("/:id", deleteBookmark);

// Export the router to be mounted in the main API routes file
export default router;