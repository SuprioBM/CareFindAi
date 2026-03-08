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
    inputLanguage: {
      type: String,
      enum: ["english", "bangla", "banglish", "unknown"],
      default: "unknown",
    },
    recommendedSpecialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      required: true,
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
    aiProvider: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    aiModel: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    aiRawResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },
    searchLatitude: {
      type: Number,
      min: -90,
      max: 90,
      default: null,
    },
    searchLongitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
    },
    searchAddress: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
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