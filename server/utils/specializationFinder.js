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
  // Example: "Internal Medicine" → "internal-medicine"
  // Example: "Cardio-Vascular Surgery" → "cardio-vascular-surgery"
  const slug = cleanName
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9\s-]/g, "") // remove special characters (keep only alphanumeric, spaces, hyphens)
    .replace(/\s+/g, "-"); // replace spaces with hyphens

  // STEP 1: Try exact name match (case-insensitive)
  // Most accurate but only works if name hasn't been modified
  // Uses regex for case-insensitive matching
  let specialization = await Specialization.findOne({
    name: { $regex: `^${cleanName}$`, $options: "i" },
  });

  if (specialization) {
    return specialization;
  }

  // STEP 2: Try slug-based lookup
  // More reliable as it normalizes all variations of the name
  // Handles differences in capitalization and spacing
  specialization = await Specialization.findOne({ slug });

  if (specialization) {
    return specialization;
  }

  // STEP 3: Create new specialization if no match found
  // Auto-generates basic description from the AI recommendation
  try {
    const newSpec = await Specialization.create({
      name: cleanName,
      slug,
      description: `Auto-created from AI recommendation: ${cleanName}`,
    });

    return newSpec;
  } catch (error) {
    // Handle race condition: another request may have created the same specialization
    // simultaneously, causing a duplicate key (11000) MongoDB error
    // In this case, fetch and return the newly created specialization
    if (error.code === 11000) {
      return await Specialization.findOne({ slug });
    }

    // Re-throw other errors (validation errors, connection issues, etc.)
    throw error;
  }
}