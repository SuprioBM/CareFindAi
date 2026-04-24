/**
 * User shall save frequently used locations, such as home or office,
 *        for quick future searches.
 *
 * This controller handles all saved location operations.
 * Users can save named places (home, office, etc.) with GPS coordinates
 * so they don't need to re-enter their address every time they search for nearby doctors.
 *
 * Available operations:
 *   - createSavedLocation     → Save a new location (home, office, or custom)
 *   - getMySavedLocations     → Get all saved locations for the logged-in user
 *   - getSavedLocationById    → Get a single saved location by ID
 *   - updateSavedLocation     → Edit a saved location (e.g., change address or label)
 *   - deleteSavedLocation     → Remove a saved location permanently
 *
 * All operations are private — user must be authenticated.
 */

import SavedLocation from "../models/savedLocation.model.js";

/**
 * Controller: Save a new location
 *
 * Called when the user fills out the "Save Location" form and submits it.
 * Creates a new saved location entry in the database linked to the logged-in user.
 *
 * Route: POST /saved-locations
 * Access: Private (must be logged in)
 *
 * Expected req.body fields:
 *   - label        (string) → "home" | "office" | "other"
 *   - customLabel  (string) → Optional custom name (e.g., "Grandma's House")
 *   - address      (string) → Full readable address string
 *   - latitude     (number) → GPS latitude coordinate
 *   - longitude    (number) → GPS longitude coordinate
 *   - isDefault    (boolean)→ Whether this is the user's default/preferred location
 */
export async function createSavedLocation(req, res) {
  try {
    // Create a new saved location document in the database.
    // req.user.id → the logged-in user's ID (set by the auth middleware)
    // ...req.body  → spreads all location fields from the request body
    //                (label, address, latitude, longitude, customLabel, isDefault)
    const savedLocation = await SavedLocation.create({
      user: req.user.id, // Tie this location to the current user
      ...req.body,        // Include all location details from the form submission
    });

    // Return 201 Created with the newly saved location data
    return res.status(201).json({
      success: true,
      message: "Location saved successfully",
      data: savedLocation,
    });
  } catch (error) {
    // Log the error for debugging (useful during development)
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to save location",
      error: error.message,
    });
  }
}

/**
 * Controller: Get all saved locations for the logged-in user
 *
 * Powers the "Saved Locations" section on the dashboard's Saved Items page.
 * Returns all locations the user has previously saved (home, office, etc.),
 * sorted from newest to oldest.
 *
 * The frontend uses this list to display location cards with address info and a map.
 * Users can also select any saved location to quickly start a nearby doctor search.
 *
 * Route: GET /saved-locations
 * Access: Private
 */
export async function getMySavedLocations(req, res) {
  try {
    // Find all saved locations that belong to this specific user.
    // Sort by createdAt descending so the most recently saved locations appear first.
    const locations = await SavedLocation.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: locations.length, // Total number of saved locations
      data: locations,         // Array of all location objects with full details
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved locations",
      error: error.message,
    });
  }
}

/**
 * Controller: Get a single saved location by its ID
 *
 * Used to fetch the full details of one specific saved location.
 * Could be used when editing a location or showing its details in a modal.
 *
 * Route: GET /saved-locations/:id
 * Access: Private
 *
 * Security: Checks both the location ID and the user ID.
 * This prevents users from accessing another user's saved locations.
 */
export async function getSavedLocationById(req, res) {
  try {
    // Find the location that matches the given ID AND belongs to the logged-in user.
    // If the ID exists but belongs to someone else, this returns null → 404.
    const location = await SavedLocation.findOne({
      _id: req.params.id, // The specific location ID from the URL parameter
      user: req.user.id,  // Must belong to the current user (security)
    });

    // If no location found → either wrong ID or owned by another user
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Saved location not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved location",
      error: error.message,
    });
  }
}

/**
 * Controller: Update an existing saved location
 *
 * Allows users to edit a previously saved location.
 * For example, they can change the label from "office" to "home",
 * update the address if they moved, or toggle the "isDefault" flag.
 *
 * Route: PATCH /saved-locations/:id
 * Access: Private
 */
export async function updateSavedLocation(req, res) {
  try {
    // Find the location by ID + user ID (security), then apply the update.
    // { new: true } → returns the updated document (not the old pre-update version)
    // { runValidators: true } → ensures updated values pass the schema's validation rules
    //   (e.g., latitude must be between -90 and 90, label must be "home/office/other")
    const location = await SavedLocation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Must match ID and be owned by this user
      req.body,                                    // The fields to update from request body
      { new: true, runValidators: true }           // Return updated doc, run validations
    );

    // If no location was found (wrong ID or not owned by this user)
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Saved location not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Saved location updated successfully",
      data: location, // Return the updated location with all new field values
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update saved location",
      error: error.message,
    });
  }
}

/**
 * Controller: Delete a saved location permanently
 *
 * Called when the user clicks the remove/delete button on a saved location card.
 * The location is permanently removed from the database and will no longer appear
 * in the user's saved locations list.
 *
 * Route: DELETE /saved-locations/:id
 * Access: Private
 *
 * Security: Validates the user ID to ensure only the owner can delete their location.
 */
export async function deleteSavedLocation(req, res) {
  try {
    // Find and delete the location in a single atomic operation.
    // If the ID exists but belongs to a different user, returns null → 404.
    const location = await SavedLocation.findOneAndDelete({
      _id: req.params.id, // The specific location to delete (from URL)
      user: req.user.id,  // Must belong to the current logged-in user (security)
    });

    // If nothing was deleted → wrong ID or not owned by this user
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Saved location not found",
      });
    }

    // Confirm the location was successfully removed
    return res.status(200).json({
      success: true,
      message: "Saved location deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete saved location",
      error: error.message,
    });
  }
}