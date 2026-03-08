import Specialization from "../models/specialization.model.js";

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
      data: specialization,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create specialization",
      error: error.message,
    });
  }
}

export async function getAllSpecializations(req, res) {
  try {
    const specializations = await Specialization.find().sort({ createdAt: -1 });

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