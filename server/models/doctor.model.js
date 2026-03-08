import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    specialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",
      required: true,
    },
    qualifications: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    hospitalOrClinic: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },
    chamberAddress: {
      type: String,
      trim: true,
      required: true,
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
      required: true,
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
    consultationDays: {
      type: [String],
      default: [],
    },
    consultationStartTime: {
      type: String,
      trim: true,
      default: "",
    },
    consultationEndTime: {
      type: String,
      trim: true,
      default: "",
    },
    appointmentPhone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
    },
    appointmentWebsite: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    fees: {
      type: Number,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    addedByAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ specialization: 1 });
doctorSchema.index({ city: 1, area: 1 });
doctorSchema.index({ latitude: 1, longitude: 1 });
doctorSchema.index({ isActive: 1, isApproved: 1 });

export default model("Doctor", doctorSchema);