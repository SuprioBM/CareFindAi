import { Schema, model } from "mongoose";

const savedLocationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      enum: ["home", "office", "other"],
      default: "other",
    },
    customLabel: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    area: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    city: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    district: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    country: {
      type: String,
      trim: true,
      default: "Bangladesh",
      maxlength: 100,
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

savedLocationSchema.index({ user: 1, createdAt: -1 });
savedLocationSchema.index({ user: 1, label: 1 });

export default model("SavedLocation", savedLocationSchema);