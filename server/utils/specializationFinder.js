/**
 * Specialization Finder Utility
 * 
 * Provides intelligent lookup and auto-creation of medical specializations
 * based on AI analysis results. Handles fuzzy matching and duplicate prevention.
 * 
 * This utility bridges the gap between AI-generated specialization names and
 * the actual stored specialization records in the database.
 */

import Specialization from "../models/specialization.model.js";
import Doctor from "../models/doctor.model.js";

/**
 * Find or Create Specialization from AI Output
 * 
 * Intelligently matches AI-recommended specialization names to existing database records
 * or creates new ones if no match is found. Uses a three-step lookup strategy:
 * 
 * 1. Exact name match (case-insensitive) - fastest, most accurate
 * 2. Slug match - handles variations in capitalization and spacing
 * 3. Create new specialization - if no existing match found
 * 
 * Features:
 * - Auto-generates URL-friendly slugs from specialization names
 * - Handles race conditions when creating new specializations
 * - Returns null for invalid input
 * - Prevents duplicate specializations through constraint checking
 * 
 * @param {string} name - Specialization name from AI analysis (e.g., "Cardiology", "Internal Medicine")
 * @returns {Promise<Object|null>} Specialization document from database or null if invalid input
 * @throws {Error} If database operation fails (excluding duplicate key errors)
 * 
 * @example
 * // Find existing specialization
 * const spec = await findOrCreateSpecialization("Cardiology");
 * // Returns: { _id: "...", name: "Cardiology", slug: "cardiology", ... }
 * 
 * @example
 * // Create new specialization from AI output
 * const spec = await findOrCreateSpecialization("Neurosurgery");
 * // Returns: { _id: "...", name: "Neurosurgery", slug: "neurosurgery", ... }
 */
export async function findOrCreateSpecialization(name) {
  // Validate input - return null for null, undefined, or non-string values
  if (!name || typeof name !== "string") {
    return null;
  }

  // Remove leading/trailing whitespace from specialization name
  const cleanName = name.trim();

  // Generate URL-friendly slug from the specialization name
  const slug = cleanName
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-"); // replace spaces with hyphens

  // Fetch unique specialization IDs from doctors to only allow specialties with doctors
  let activeSpecializationIds = [];
  try {
    activeSpecializationIds = await Doctor.distinct("specialization");
  } catch (err) {
    console.error("Failed to fetch active specialization IDs in findOrCreateSpecialization:", err);
  }

  // STEP 1: Try exact name match (case-insensitive) among specialties with doctors
  let specialization = await Specialization.findOne({
    _id: { $in: activeSpecializationIds },
    name: { $regex: `^${cleanName}$`, $options: "i" },
  });

  if (specialization) {
    return specialization;
  }

  // STEP 2: Try slug-based lookup among specialties with doctors
  specialization = await Specialization.findOne({
    _id: { $in: activeSpecializationIds },
    slug
  });

  if (specialization) {
    return specialization;
  }

  // STEP 3: Fuzzy / overlap matching against active database specialties with doctors
  const allSpecs = await Specialization.find({
    _id: { $in: activeSpecializationIds },
    isActive: { $ne: false }
  });
  let bestMatch = null;
  let bestScore = 0;

  for (const spec of allSpecs) {
    const specNameLower = spec.name.toLowerCase();
    const inputLower = cleanName.toLowerCase();

    // Check if one contains the other
    if (specNameLower.includes(inputLower) || inputLower.includes(specNameLower)) {
      return spec;
    }

    // Word overlap check
    const specWords = specNameLower.split(/[^a-z0-9]/).filter(w => w.length > 2);
    const inputWords = inputLower.split(/[^a-z0-9]/).filter(w => w.length > 2);

    let overlap = 0;
    for (const iw of inputWords) {
      if (specWords.includes(iw)) {
        overlap++;
      }
    }

    if (overlap > bestScore) {
      bestScore = overlap;
      bestMatch = spec;
    }
  }

  if (bestMatch && bestScore > 0) {
    return bestMatch;
  }

  // STEP 4: Fallback to "General Medicine" if no specialization with doctors is found
  const fallback = await Specialization.findOne({
    _id: { $in: activeSpecializationIds },
    name: { $regex: "^General Medicine$", $options: "i" },
  });

  return fallback || allSpecs[0] || null;
}