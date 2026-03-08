import { Schema, model } from "mongoose";

const doctorJoinRequestSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
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
    hospitalOrClinic: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },
    chamberAddress: {
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
      min: -90,
      max: 90,
      default: null,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
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
    documents: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

doctorJoinRequestSchema.index({ email: 1 });
doctorJoinRequestSchema.index({ specialization: 1 });
doctorJoinRequestSchema.index({ status: 1, createdAt: -1 });

export default model("DoctorJoinRequest", doctorJoinRequestSchema);