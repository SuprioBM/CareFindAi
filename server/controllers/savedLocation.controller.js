import SavedLocation from "../models/savedLocation.model.js";

export async function createSavedLocation(req, res) {
  try {
    const savedLocation = await SavedLocation.create({
      user: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Location saved successfully",
      data: savedLocation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save location",
      error: error.message,
    });
  }
}

export async function getMySavedLocations(req, res) {
  try {
    const locations = await SavedLocation.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved locations",
      error: error.message,
    });
  }
}

export async function getSavedLocationById(req, res) {
  try {
    const location = await SavedLocation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

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

export async function updateSavedLocation(req, res) {
  try {
    const location = await SavedLocation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Saved location not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Saved location updated successfully",
      data: location,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update saved location",
      error: error.message,
    });
  }
}

export async function deleteSavedLocation(req, res) {
  try {
    const location = await SavedLocation.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Saved location not found",
      });
    }

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