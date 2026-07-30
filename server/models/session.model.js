import { Schema, model } from "mongoose";

const symptomSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "ABANDONED"],
      default: "ACTIVE",
    },
    conversationHistory: [
      {
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    clinicalState: {
      sessionId: String,
      demographics: {
        age: { type: Number, default: null },
        gender: { type: String, default: null },
      },
      symptoms: { type: [String], default: [] },
      symptomTimeline: { type: Map, of: String, default: {} },
      severity: { type: Map, of: String, default: {} },
      riskFactors: { type: [String], default: [] },
      medications: { type: [String], default: [] },
      medicalHistory: { type: [String], default: [] },
      redFlags: { type: [String], default: [] },
      answeredQuestions: { type: [String], default: [] },
      missingQuestions: { type: [String], default: [] },
      urgencyLevel: { type: String, default: null },
      recommendedSpecialty: { type: String, default: null },
      confidenceScore: { type: Number, default: null },
    },
    questionHistory: [
      {
        questionKey: String,
        text: String,
        answer: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    finalRecommendation: {
      specialist: { type: String, default: null },
      urgencyLevel: { type: String, default: null },
      explanation: { type: String, default: null },
      matchedSymptoms: { type: [String], default: [] },
      warningMessage: { type: String, default: null },
      canShowDoctors: { type: Boolean, default: false },
      recommendedSpecialization: {
        type: Schema.Types.ObjectId,
        ref: "Specialization",
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

symptomSessionSchema.index({ user: 1, createdAt: -1 });

export default model("SymptomSession", symptomSessionSchema);
