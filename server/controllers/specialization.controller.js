/**
 * Specialization Controller
 * 
 * Handles all CRUD operations for medical specialization categories.
 * Provides endpoints for:
 * - Creating new specializations
 * - Retrieving all specializations with doctor counts
 * - Getting a specific specialization by ID
 * - Updating specialization details
 * - Deleting specializations
 * 
 * All operations include proper error handling and response formatting.
 */

import Specialization from "../models/specialization.model.js";
import Doctor from "../models/doctor.model.js";

/**
 * Create a new specialization
 * 
 * POST /specializations
 * Requires authentication and admin role
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.name - Specialization name (required, unique)
 * @param {string} req.body.slug - URL-friendly identifier (required, unique)
 * @param {string} req.body.description - Detailed description (optional)
 * @param {string} req.body.icon - Material Design icon name (optional)
 * @param {boolean} req.body.isActive - Whether specialization is active (optional, default: true)
 * @param {Object} res - Express response object
 * @returns {Object} Created specialization with doctorCount: 0
 * @status 201 - Successfully created
 * @status 500 - Server error
 */
export async function createSpecialization(req, res) {
  try {
    const { name, slug, description, icon, isActive } = req.body;

    const specialization = await Specialization.create({
      name,
      slug,
      description,
      icon,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Specialization created successfully",
      data: { ...specialization.toObject(), doctorCount: 0 },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create specialization",
      error: error.message,
    });
  }
}

/**
 * Get all specializations with doctor counts
 * 
 * GET /specializations
 * Requires authentication and admin role
 * 
 * Uses MongoDB aggregation pipeline to:
 * 1. Sort specializations by creation date (newest first)
 * 2. Lookup and count doctors assigned to each specialization
 * 3. Exclude the doctors array from response (only keep count)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Array of specializations with doctorCount field
 * @status 200 - Successfully retrieved
 * @status 500 - Server error
 */
export async function getAllSpecializations(req, res) {
  try {
    const specializations = await Specialization.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "specialization",
          as: "doctors",
        },
      },
      {
        $addFields: {
          doctorCount: { $size: "$doctors" },
        },
      },
      {
        $project: {
          doctors: 0, // drop the joined array, keep only the count
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: specializations.length,
      data: specializations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch specializations",
      error: error.message,
    });
  }
}

/**
 * Get a specific specialization by ID
 * 
 * GET /specializations/:id
 * Public endpoint (no authentication required)
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB ObjectId of the specialization
 * @param {Object} res - Express response object
 * @returns {Object} Specialization details or 404 if not found
 * @status 200 - Successfully retrieved
 * @status 404 - Specialization not found
 * @status 500 - Server error
 */
export async function getSpecializationById(req, res) {
  try {
    const specialization = await Specialization.findById(req.params.id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: specialization,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch specialization",
      error: error.message,
    });
  }
}

/**
 * Update a specialization
 * 
 * PATCH /specializations/:id
 * Requires authentication and admin role
 * 
 * Updates specialization fields (name, slug, description, icon, isActive)
 * Validates updated data against schema constraints
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB ObjectId of the specialization to update
 * @param {Object} req.body - Fields to update (partial update allowed)
 * @param {Object} res - Express response object
 * @returns {Object} Updated specialization or 404 if not found
 * @status 200 - Successfully updated
 * @status 404 - Specialization not found
 * @status 500 - Server error
 */
export async function updateSpecialization(req, res) {
  try {
    const specialization = await Specialization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Specialization updated successfully",
      data: specialization,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update specialization",
      error: error.message,
    });
  }
}

/**
 * Delete a specialization
 * 
 * DELETE /specializations/:id
 * Requires authentication and admin role
 * 
 * Permanently removes a specialization from the database.
 * Note: Consider the impact on doctors assigned to this specialization.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.id - MongoDB ObjectId of the specialization to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message or 404 if not found
 * @status 200 - Successfully deleted
 * @status 404 - Specialization not found
 * @status 500 - Server error
 */
export async function deleteSpecialization(req, res) {
  try {
    const specialization = await Specialization.findByIdAndDelete(req.params.id);

    if (!specialization) {
      return res.status(404).json({
        success: false,
        message: "Specialization not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Specialization deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete specialization",
      error: error.message,
    });
  }
}