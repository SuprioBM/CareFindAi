/**
 * User shall view their previous symptom searches along with the AI-recommended specialists.
 *
 * This controller handles all API operations related to symptom search history.
 * When a user enters symptoms and gets an AI recommendation, the result is saved
 * using `createSymptomSearch`. Later, users can view all their past searches from
 * their dashboard using `getMySymptomSearches`.
 *
 * Available operations:
 *   - createSymptomSearch   → Save a new AI symptom analysis result
 *   - getMySymptomSearches  → Get the full history list for the logged-in user
 *   - getSymptomSearchById  → Get details of a single specific past search
 *   - deleteSymptomSearch   → Remove a specific search from history
 */

// Import the Mongoose model for SymptomSearch collection
import SymptomSearch from "../models/symptomSearch.model.js";

/**
 * Controller: Save a new symptom search result
 *
 * Called automatically after the AI analyzes the user's symptoms.
 * This saves the analysis (specialist recommendation, urgency, reasons, etc.)
 * to the database so the user can review it later in their history.
 *
 * Route: POST /symptom-searches
 * Access: Private (user must be logged in — protected by auth middleware)
 *
 * What req.body should contain:
 *   - symptomsText               (string)  — what the user typed
 *   - recommendedSpecialization  (ObjectId) — which specialist was recommended
 *   - recommendedSpecializationName (string) — name of that specialist
 *   - analysisReason             (string)  — AI's explanation
 *   - urgencyLevel               (string)  — "low" | "medium" | "high" | "emergency"
 *   - warningMessage             (string)  — optional warning
 *   - matchedSymptoms            (array)   — keywords AI detected
 *   - canShowDoctors             (boolean) — should frontend show matching doctors?
 *   - retrievalQuery             (string)  — used internally for doctor retrieval
 */
export async function createSymptomSearch(req, res) {
  try {
    // Create a new document in the database.
    // We attach the logged-in user's ID (from the auth middleware) plus all
    // the analysis data sent from the frontend (spread from req.body).
    const symptomSearch = await SymptomSearch.create({
      user: req.user.id, // Ensures this search is tied to the correct user
      ...req.body,       // Spreads all AI result fields (symptoms, specialist, urgency, etc.)
    });

    // Return the newly created record with HTTP 201 (Created)
    return res.status(201).json({
      success: true,
      message: "Symptom analysis saved successfully",
      data: symptomSearch,
    });
  } catch (error) {
    // If saving fails (e.g., database error or validation issue), return 500
    return res.status(500).json({
      success: false,
      message: "Failed to save symptom analysis",
      error: error.message,
    });
  }
}

/**
 * Controller: Get all symptom searches of the logged-in user
 *
 * This powers the "Previous Searches" page in the dashboard.
 * It fetches ALL past AI analyses for the current user, sorted from newest to oldest,
 * so the user can scroll through their full history and click any entry to see details.
 *
 * Route: GET /symptom-searches
 * Access: Private
 *
 * Response includes full specialization details (via populate) and timestamps.
 */
export async function getMySymptomSearches(req, res) {
  try {
    // Query the database for all symptom searches belonging to this specific user.
    const searches = await SymptomSearch.find({ user: req.user.id })

      // "populate" replaces the raw specialization ObjectId with the actual
      // specialization document — so instead of just an ID, we get the full
      // specialization name, description, etc. (similar to a SQL JOIN)
      .populate("recommendedSpecialization")

      // Sort by creation date descending — newest searches appear first in the list
      .sort({ createdAt: -1 });

    // Return the list along with how many records were found
    return res.status(200).json({
      success: true,
      count: searches.length,  // Total number of past searches
      data: searches,          // Array of all past searches with full details
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch symptom history",
      error: error.message,
    });
  }
}

/**
 * Controller: Get a single symptom search by its ID
 *
 * Used when the user clicks on a specific search from their history list
 * to see the full AI analysis details (explanation, urgency, matched symptoms, etc.)
 *
 * Route: GET /symptom-searches/:id
 * Access: Private
 *
 * Security: We filter by BOTH the record's ID AND the user's ID.
 * This prevents User A from accessing User B's search history even if they
 * guess the correct search ID.
 */
export async function getSymptomSearchById(req, res) {
  try {
    // Find a search where:
    //   - The _id matches the URL parameter (the specific search record)
    //   - The user matches the logged-in user's ID (security check)
    // This ensures users can only see their OWN searches.
    const search = await SymptomSearch.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("recommendedSpecialization"); // Include full specialization info

    // If no matching record found → either wrong ID or belongs to another user
    if (!search) {
      return res.status(404).json({
        success: false,
        message: "Symptom search not found",
      });
    }

    // Return the single search record with all details
    return res.status(200).json({
      success: true,
      data: search,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch symptom search",
      error: error.message,
    });
  }
}

/**
 * Controller: Delete a specific symptom search from history
 *
 * Allows users to remove a past search they no longer want to keep in history.
 * The record is permanently deleted from the database.
 *
 * Route: DELETE /symptom-searches/:id
 * Access: Private
 *
 * Security: Same as above — we check both the ID and the user ID so users
 * can only delete their OWN search records, not others'.
 */
export async function deleteSymptomSearch(req, res) {
  try {
    // Find the document matching both the search ID AND the user's ID,
    // then delete it in a single atomic operation.
    // If someone tries to delete another user's record, this returns null.
    const search = await SymptomSearch.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    // If nothing was deleted → the record doesn't exist or doesn't belong to this user
    if (!search) {
      return res.status(404).json({
        success: false,
        message: "Symptom search not found",
      });
    }

    // Confirm successful deletion
    return res.status(200).json({
      success: true,
      message: "Symptom search deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete symptom search",
      error: error.message,
    });
  }
}