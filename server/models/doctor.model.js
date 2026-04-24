/**
 * The system shall allow users to view detailed doctor profiles,
 *        including specialization, chamber information, and contact details from the dashboard.
 *
 * This Mongoose model defines the complete database structure for a Doctor profile.
 * Every doctor in the CareFindAI system is stored as a document using this schema.
 *
 * The information stored here is exactly what users see when they open a doctor's profile:
 *   - Their name, qualifications, and specialization
 *   - Where their chamber is located (hospital, address, area, city)
 *   - Contact details (phone, website)
 *   - Appointment fees, available consultation types, and off-days
 *   - GPS coordinates for the map and nearby doctor search feature
 *   - Profile image and biography
 *
 * Doctors can be added by admins or through join requests.
 * Only "approved" and "active" doctors appear in patient-facing search results.
 */

import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    // ── Basic Identity ──────────────────────────────────────────────────────

    // The doctor's full name as it will appear in the profile and search results.
    // e.g., "Dr. Rafiqul Islam" — required, 2 to 120 characters.
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    // ── Specialization (shown in doctor profile) ─────────────────────

    // Reference to the Specialization collection.
    // This links the doctor to their medical specialty category.
    // e.g., ObjectId pointing to the "Cardiology" specialization document.
    specialization: {
      type: Schema.Types.ObjectId,
      ref: "Specialization",  // When populated, replaces ID with full specialization object
      required: true,
    },

    // Denormalized copy of the specialization name (stored directly for fast filtering).
    // e.g., "Cardiology" — avoids needing a JOIN just to filter by specialty name.
    specializationName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    // ── Qualifications & Experience (displayed in profile) ───────────

    // The doctor's academic and professional degrees.
    // e.g., "MBBS, FCPS (Medicine), MD (Cardiology)"
    qualifications: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    // How many years the doctor has been practicing medicine.
    // Used to display experience on the profile card. Minimum 0 years.
    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },

    // The doctor's gender — used for search filtering.
    // Some patients prefer a specific gender for their doctor.
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },

    // ── Chamber / Clinic Information (chamber info in profile) ────────

    // The name of the hospital or clinic where the doctor sees patients.
    // e.g., "Square Hospital", "Ibrahim General Hospital"
    hospitalOrClinic: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    // The full street address of the doctor's chamber.
    // e.g., "House 15, Road 7, Block B, Bashundhara R/A"
    // Required — patients need this to physically visit the doctor.
    chamberAddress: {
      type: String,
      trim: true,
      required: true,
      maxlength: 300,
    },

    // The neighborhood or area within the city.
    // e.g., "Dhanmondi", "Gulshan", "Mirpur"
    // Used for area-based filtering in the doctor search feature.
    area: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    // The city where the doctor's chamber is located.
    // e.g., "Dhaka", "Chittagong"
    // Required — used for city-level filtering in search results.
    city: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },

    // The district (larger administrative area than the city).
    // e.g., "Dhaka", "Gazipur"
    district: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    // The country where the doctor practices. Defaults to "Bangladesh".
    country: {
      type: String,
      trim: true,
      default: "Bangladesh",
      maxlength: 100,
    },

    // ── GPS Coordinates (used for map & nearby search) ───────────────────────

    // Latitude coordinate of the doctor's chamber location.
    // Valid range: -90 (South Pole) to 90 (North Pole).
    // Used to place the doctor's pin on the map.
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    // Longitude coordinate of the doctor's chamber location.
    // Valid range: -180 to 180 degrees.
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    // GeoJSON "Point" format for MongoDB's geospatial queries (2dsphere index).
    // Stored as [longitude, latitude] (Note: GeoJSON uses lng first, then lat).
    // This is what enables the "Find Nearby Doctors" feature — MongoDB uses this
    // field with $near/$geoNear to find doctors within a certain radius.
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // Format: [longitude, latitude] — GeoJSON standard
        required: true,
      },
    },

    // ── Contact & Appointment Info (contact details in profile) ───────

    // Type of consultation offered by the doctor.
    // e.g., "In-person only", "Telemedicine available", "Both"
    consultation: {
      type: String,
      trim: true,
      default: "",
    },

    // List of phone numbers for booking an appointment.
    // Stored as an array because some doctors have multiple phone lines.
    // e.g., ["01711-123456", "02-9876543"]
    appointmentPhone: {
      type: [String],
      default: [],
    },

    // The doctor's website or online appointment booking URL.
    // e.g., "https://doctorapp.com/dr-islam" or a hospital booking page.
    appointmentWebsite: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    // ── Profile Content ──────────────────────────────────────────────────────

    // A short biography or introduction written by or about the doctor.
    // Displayed in the "About" section of the doctor's profile page.
    // Max 2000 characters.
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
    },

    // URL path to the doctor's profile photo.
    // Used in search result cards and the doctor's profile page.
    // e.g., "/uploads/doctors/dr-islam-profile.jpg"
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Appointment Details ──────────────────────────────────────────────────

    // The consultation fee charged by the doctor per visit.
    // e.g., 500 (means 500 BDT). 0 means free or not specified.
    fees: {
      type: Number,
      min: 0,
      default: 0,
    },

    // The day(s) when the doctor's chamber is closed.
    // e.g., "Friday", "Friday-Saturday"
    // Patients use this to know when NOT to schedule an appointment.
    offday: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Moderation Flags ─────────────────────────────────────────────────────

    // Whether the doctor's profile is currently active (visible in searches).
    // false → profile is hidden from patients (e.g., doctor on leave).
    isActive: {
      type: Boolean,
      default: true,
    },

    // Whether the admin has approved this doctor's profile.
    // false → profile is pending review and won't show in search results.
    // true  → approved and visible to patients.
    isApproved: {
      type: Boolean,
      default: true,
    },

    // Reference to the admin user who added/approved this doctor profile.
    // Null if added through an automated process or join request.
    addedByAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    // Automatically adds "createdAt" and "updatedAt" fields to every document.
    timestamps: true,
  }
);

// ── Database Indexes ─────────────────────────────────────────────────────────
// These indexes dramatically speed up the most common database queries.

// Fast lookup by specialization — used when patients filter doctors by specialty
doctorSchema.index({ specialization: 1 });

// Fast lookup by specialization name text — used for name-based specialty filtering
doctorSchema.index({ specializationName: 1 });

// Combined index for city + area — used in location-based doctor search
doctorSchema.index({ city: 1, area: 1 });

// Combined index for filtering only active + approved doctors (most search queries use this)
doctorSchema.index({ isActive: 1, isApproved: 1 });

// 2dsphere index — REQUIRED for geospatial queries (nearby doctor search feature).
// This allows MongoDB to efficiently find doctors within a radius of a given GPS point.
doctorSchema.index({ location: "2dsphere" });

// Export the model — this creates the "doctors" collection in MongoDB
export default model("Doctor", doctorSchema);