import { Schema, model } from "mongoose";

const symptomSearchSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symptomsText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    
    recommendedSpecialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      default: null,
    },
    recommendedSpecializationName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    analysisReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high", "emergency"],
      default: "low",
    },
    warningMessage: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
    matchedSymptoms: {
      type: [String],
      default: [],
    },
    canShowDoctors: {
      type: Boolean,
      default: false,
    },
    retrievalQuery: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

symptomSearchSchema.index({ user: 1, createdAt: -1 });
symptomSearchSchema.index({ recommendedSpecialization: 1 });
symptomSearchSchema.index({ urgencyLevel: 1 });

export default model("SymptomSearch", symptomSearchSchema);