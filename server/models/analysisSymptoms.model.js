import { Schema, model } from "mongoose";

const analysisSchema = new Schema(
  {
    symptoms: { type: String, required: true },
    language: { type: String, default: "en" },

    specialist: { type: String, default: "" },
    matchedSymptoms: { type: [String], default: [] },
    canShowDoctors: { type: Boolean, default: false },

    urgency: { type: String, default: "low" },
    warningMessage: { type: String, default: "" },

    explanation: { type: String, default: "" },

    rawResult: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const Analysis = model("Analysis", analysisSchema);