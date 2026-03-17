import Specialization from "../models/specialization.model.js";

/**
 * Find or create specialization from AI output
 */
export async function findOrCreateSpecialization(name) {
  if (!name || typeof name !== "string") {
    return null;
  }

  const cleanName = name.trim();

  // helper to generate slug
  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-"); // spaces → hyphen

  // 1️⃣ Try exact match (case-insensitive)
  let specialization = await Specialization.findOne({
    name: { $regex: `^${cleanName}$`, $options: "i" },
  });

  if (specialization) {
    return specialization;
  }

  // 2️⃣ Try by slug (safer unique check)
  specialization = await Specialization.findOne({ slug });

  if (specialization) {
    return specialization;
  }

  // 3️⃣ Create new specialization
  try {
    const newSpec = await Specialization.create({
      name: cleanName,
      slug,
      description: `Auto-created from AI recommendation: ${cleanName}`,
    });

    return newSpec;
  } catch (error) {
    // handle race condition (duplicate created at same time)
    if (error.code === 11000) {
      return await Specialization.findOne({ slug });
    }

    throw error;
  }
}