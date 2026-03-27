// Import the Mongoose model for SymptomSearch collection
import SymptomSearch from "../models/symptomSearch.model.js";

/**
 * Controller: Create a new symptom search
 * Route: POST /symptom-searches
 * Access: Private (user must be logged in)
 */
export async function createSymptomSearch(req, res) {
  try {
    // Create a new document in DB
    const symptomSearch = await SymptomSearch.create({
      user: req.user.id, // attach logged-in user's ID
      ...req.body,       // spread all data sent from frontend
    });

    // Send success response
    return res.status(201).json({
      success: true,
      message: "Symptom analysis saved successfully",
      data: symptomSearch,
    });
  } catch (error) {
    // Handle server/database errors
    return res.status(500).json({
      success: false,
      message: "Failed to save symptom analysis",
      error: error.message,
    });
  }
}

/**
 * Controller: Get all symptom searches of logged-in user
 * Route: GET /symptom-searches
 * Access: Private
 */
export async function getMySymptomSearches(req, res) {
  try {
    // Find all searches belonging to this user
    const searches = await SymptomSearch.find({ user: req.user.id })

      // Populate replaces reference ID with actual document (like JOIN)
      .populate("recommendedSpecialization")

      // Sort newest first
      .sort({ createdAt: -1 });

    // Send response
    return res.status(200).json({
      success: true,
      count: searches.length,
      data: searches,
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
 * Controller: Get a single symptom search by ID
 * Route: GET /symptom-searches/:id
 * Access: Private
 */
export async function getSymptomSearchById(req, res) {
  try {
    // Find search by ID AND ensure it belongs to logged-in user
    const search = await SymptomSearch.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("recommendedSpecialization");

    // If not found, return 404
    if (!search) {
      return res.status(404).json({
        success: false,
        message: "Symptom search not found",
      });
    }

    // Send success response
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
 * Controller: Delete a symptom search
 * Route: DELETE /symptom-searches/:id
 * Access: Private
 */
export async function deleteSymptomSearch(req, res) {
  try {
    // Find and delete ONLY if it belongs to the logged-in user
    const search = await SymptomSearch.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    // If no document found → return 404
    if (!search) {
      return res.status(404).json({
        success: false,
        message: "Symptom search not found",
      });
    }

    // Send success response
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