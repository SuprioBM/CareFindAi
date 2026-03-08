import SymptomSearch from "../models/symptomSearch.model.js";

export async function createSymptomSearch(req, res) {
  try {
    const symptomSearch = await SymptomSearch.create({
      user: req.user.id,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Symptom analysis saved successfully",
      data: symptomSearch,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to save symptom analysis",
      error: error.message,
    });
  }
}

export async function getMySymptomSearches(req, res) {
  try {
    const searches = await SymptomSearch.find({ user: req.user.id })
      .populate("recommendedSpecialization")
      .sort({ createdAt: -1 });

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

export async function getSymptomSearchById(req, res) {
  try {
    const search = await SymptomSearch.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("recommendedSpecialization");

    if (!search) {
      return res.status(404).json({
        success: false,
        message: "Symptom search not found",
      });
    }

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

export async function deleteSymptomSearch(req, res) {
  try {
    const search = await SymptomSearch.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!search) {
      return res.status(404).json({
        success: false,
        message: "Symptom search not found",
      });
    }

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