/**
 * User shall save frequently used locations, such as home or office,
 *        for quick future searches.
 *
 * This Mongoose model defines the database structure for a "SavedLocation".
 * Users can save common places they frequently use — like their home or office —
 * so they don't have to type in the address every time they search for nearby doctors.
 *
 * For example:
 *   - A user saves "Home" at 23.8103° N, 90.4125° E (Dhaka)
 *   - Next time they search for doctors, they can just pick "Home" from their saved list
 *     and the app automatically searches nearby that location.
 *
 * Each saved location belongs to exactly one user and stores coordinates + label info.
 */

import { Schema, model } from "mongoose";

const savedLocationSchema = new Schema(
  {
    // The user who saved this location.
    // Required — every saved location must be associated with a specific user.
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // A category/type label for the location.
    // "home"   → the user's home address
    // "office" → the user's workplace
    // "other"  → any other location (hospital, relative's house, etc.)
    // Displayed with appropriate icons in the UI.
    label: {
      type: String,
      enum: ["home", "office", "other"],
      default: "other",
    },

    // An optional custom name the user gives this location.
    // For example, instead of "other", the user might write "Mom's House".
    // Displayed as the primary name if provided.
    customLabel: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    // The full street/area address of this location as a readable string.
    // e.g., "House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh"
    // Required — used to display the address to the user.
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // Geographic latitude of the saved location (north/south coordinate).
    // Range: -90 to 90 degrees.
    // Used for map display and nearby doctor searches.
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },

    // Geographic longitude of the saved location (east/west coordinate).
    // Range: -180 to 180 degrees.
    // Used together with latitude for map and proximity searches.
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },

    // Whether this is the user's default location.
    // If true, this location may be pre-selected when the user opens the doctor search.
    // Only one location per user should be set as default.
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  // Automatically adds "createdAt" and "updatedAt" timestamps to each document.
  { timestamps: true }
);

// Export the model — this creates the "savedlocations" collection in MongoDB
export default model("SavedLocation", savedLocationSchema);