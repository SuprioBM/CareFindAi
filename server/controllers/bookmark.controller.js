/**
 * The system shall allow users to save or bookmark doctors for quick future reference.
 *
 * This controller manages all bookmark-related operations.
 * A "bookmark" is when a user saves/favorites a doctor they liked or want to revisit.
 *
 * Users can:
 *   - Bookmark (save) a doctor            → createBookmark
 *   - View all their saved doctors         → getMyBookmarks
 *   - Get details of one saved doctor      → getBookmarkById
 *   - Update bookmark (e.g., link location)→ updateBookmark
 *   - Remove a bookmarked doctor           → deleteBookmark
 *
 * All functions are private — the user must be logged in.
 */

import Bookmark from "../models/bookmark.model.js";

/**
 * Controller: Bookmark (save) a doctor
 *
 * When the user clicks the "Save" or heart icon on a doctor's profile,
 * this function is called to add that doctor to their saved list.
 *
 * It first checks if the doctor is ALREADY bookmarked by this user — if yes,
 * it rejects the duplicate request. Otherwise, it creates a new bookmark record.
 *
 * Route: POST /bookmarks
 * Access: Private (must be logged in)
 */
export async function createBookmark(req, res) {
  try {
    // Extract the doctor ID (required) and an optional saved location ID from the request body.
    // The savedLocation is optional — the user might also want to associate
    // a preferred location (e.g., "Home") with this bookmarked doctor.
    const { doctor, savedLocation } = req.body;

    // Check if this user has already bookmarked this doctor.
    // We look for an existing record with the same user + doctor combination.
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      doctor,
    });

    // If a bookmark already exists, return 409 Conflict to prevent duplicates.
    // This enforces the unique constraint at the application level too.
    if (existingBookmark) {
      return res.status(409).json({
        success: false,
        message: "Doctor already bookmarked",
      });
    }

    // No duplicate found — create the new bookmark record in the database.
    // We link the logged-in user's ID, the doctor's ID, and optionally a saved location.
    const bookmark = await Bookmark.create({
      user: req.user.id,           // Who is bookmarking
      doctor,                       // Which doctor is being saved
      savedLocation: savedLocation || null, // Optional: link to a saved location
    });

    // Return 201 Created with the new bookmark data
    return res.status(201).json({
      success: true,
      message: "Doctor bookmarked successfully",
      data: bookmark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create bookmark",
      error: error.message,
    });
  }
}

/**
 * Controller: Get all bookmarked doctors for the logged-in user
 *
 * Powers the "Saved Doctors" section visible on the dashboard and the Saved Items page.
 * Returns a list of all doctors the user has bookmarked, with full doctor details
 * (name, specialization, photo, fees, etc.) populated from the Doctor collection.
 *
 * Route: GET /bookmarks
 * Access: Private
 */
export async function getMyBookmarks(req, res) {
  try {
    // Find all bookmarks that belong to the logged-in user.
    const bookmarks = await Bookmark.find({ user: req.user.id })
      // Populate "doctor" to replace the doctor ID with the full doctor document.
      // Inside the doctor, also populate their "specialization" (nested populate).
      // This way we get: doctor.fullName, doctor.profileImage, doctor.specialization.name, etc.
      .populate({
        path: "doctor",
        populate: {
          path: "specialization", // Nested populate: get specialization details inside doctor
        },
      })
      // Also populate the optional saved location linked to each bookmark
      .populate("savedLocation")
      // Sort newest bookmarks first so recently saved doctors appear at the top
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookmarks.length, // Total number of saved doctors
      data: bookmarks,         // Array of bookmarks with full doctor + location details
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookmarks",
      error: error.message,
    });
  }
}

/**
 * Controller: Get a single bookmark by its ID
 *
 * Fetches the detailed data for one specific bookmarked doctor.
 * Useful when the user clicks on a saved doctor card to see more info.
 *
 * Route: GET /bookmarks/:id
 * Access: Private
 *
 * Security: Checks BOTH the bookmark ID and the user ID — so users can only
 * view their OWN bookmarks, not other users' saved doctors.
 */
export async function getBookmarkById(req, res) {
  try {
    // Find the bookmark that matches the given ID AND belongs to the logged-in user.
    const bookmark = await Bookmark.findOne({
      _id: req.params.id, // The specific bookmark to fetch (from URL)
      user: req.user.id,  // Must belong to the current user (security)
    })
      .populate({
        path: "doctor",
        populate: {
          path: "specialization", // Get full specialization info inside the doctor
        },
      })
      .populate("savedLocation"); // Include linked location info if present

    // If not found → either wrong ID or it belongs to another user
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: bookmark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookmark",
      error: error.message,
    });
  }
}

/**
 * Controller: Update a bookmark (e.g., link/change a saved location)
 *
 * Allows the user to update information associated with a bookmark.
 * Most commonly used to link or change the saved location for a bookmarked doctor.
 *
 * Route: PATCH /bookmarks/:id
 * Access: Private
 */
export async function updateBookmark(req, res) {
  try {
    // Find the bookmark by ID + user ID (security check), then apply the update.
    // { new: true } returns the updated document (not the old one).
    // { runValidators: true } ensures the update data passes schema validation rules.
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Filter: must match ID and owner
      req.body,                                    // Update: fields sent from frontend
      { new: true, runValidators: true }           // Options: return updated doc + validate
    )
      .populate("doctor")         // Include full doctor details in the response
      .populate("savedLocation"); // Include full location details in the response

    // If no bookmark was found (wrong ID or not owned by this user)
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookmark updated successfully",
      data: bookmark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update bookmark",
      error: error.message,
    });
  }
}

/**
 * Controller: Remove a bookmarked doctor
 *
 * Called when the user clicks the trash/unsave button on a saved doctor card.
 * Permanently removes the bookmark from the database — the doctor is no longer
 * in the user's saved list after this.
 *
 * Route: DELETE /bookmarks/:id
 * Access: Private
 *
 * Security: Checks user ID so a user cannot delete someone else's bookmarks.
 */
export async function deleteBookmark(req, res) {
  try {
    // Find the bookmark matching this ID AND belonging to this user, then delete it.
    // This is atomic — find and delete happen in one operation.
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id, // The bookmark to remove (from URL)
      user: req.user.id,  // Must belong to the current user (security check)
    });

    // If no bookmark was found → wrong ID or belongs to another user
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    // Confirm the bookmark was removed successfully
    return res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete bookmark",
      error: error.message,
    });
  }
}