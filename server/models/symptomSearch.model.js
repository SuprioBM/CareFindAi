/**
 * User shall view their previous symptom searches along with the AI-recommended specialists.
 *
 * This Mongoose model defines the structure (schema) for storing a single symptom search record
 * in the MongoDB database. Each time a user submits symptoms to the AI, the result is saved here
 * so they can review it later from their dashboard under "Previous Searches".
 *
 * Every document in this collection represents ONE AI analysis session for a user.
 */

import { Schema, model } from "mongoose";

const symptomSearchSchema = new Schema(
  {
    // Links this symptom search to a specific user (who submitted it).
    // Required — we always need to know which user owns this search history.
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The raw text the user typed in — e.g., "I have fever, headache, and sore throat".
    // This is what the user submitted to the AI. Max 5000 characters.
    symptomsText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // The ObjectId reference to the Specialization the AI recommended.
    // For example, if AI suggests "see a Cardiologist", this stores the Cardiologist's ID.
    // Null if no specialization was determined.
    recommendedSpecialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      default: null,
    },

    // A plain text copy of the recommended specialization name.
    // e.g., "Cardiology" — stored separately for easier display without joining tables.
    recommendedSpecializationName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },

    // The AI's explanation of WHY it recommended this specialization.
    // e.g., "Your symptoms of chest pain and shortness of breath may indicate a heart issue."
    analysisReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    // How urgent the AI thinks the situation is.
    // "low"       → routine check-up level
    // "medium"    → should see a doctor soon
    // "high"      → see a doctor as soon as possible
    // "emergency" → go to emergency room immediately
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "low",
    },

    // An optional warning message to show the user, like
    // "These symptoms could indicate a serious condition. Please seek immediate care."
    warningMessage: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },

    // The list of specific symptom keywords the AI matched from the user's input.
    // e.g., ["fever", "headache", "sore throat"]
    // Stored as an array of strings.
    matchedSymptoms: {
      type: [String],
      default: [],
    },

    // A boolean flag that tells the frontend whether to show matching doctors to the user.
    // If true → the frontend shows a list of doctors for the recommended specialist.
    // If false → the AI was not confident enough to display doctors.
    canShowDoctors: {
      type: Boolean,
      default: false,
    },

    // A search query string used to fetch relevant doctors from the RAG (AI retrieval) system.
    // e.g., "cardiologist near dhaka" — used internally to find matching doctors.
    retrievalQuery: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  {
    // Automatically adds "createdAt" and "updatedAt" fields to every document.
    // "createdAt" is used to show WHEN the symptom search was made in the history list.
    timestamps: true,
  }
);

// ── Database Indexes ─────────────────────────────────────────────────────────
// These indexes speed up database queries so data is returned faster.

// Most common query: "give me all searches by this user, newest first"
symptomSearchSchema.index({ user: 1, createdAt: -1 });

// For filtering searches by which specialization was recommended
symptomSearchSchema.index({ recommendedSpecialization: 1 });

// For filtering searches by urgency level (e.g., show only "emergency" ones)
symptomSearchSchema.index({ urgencyLevel: 1 });

// Export the model — this creates the "symptomsearches" collection in MongoDB
export default model("SymptomSearch", symptomSearchSchema);