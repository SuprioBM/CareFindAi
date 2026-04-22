/**
 * The system shall allow users to save or bookmark doctors for quick future reference.
 *
 * This Mongoose model defines the database structure for a "Bookmark" — which represents
 * a user saving/bookmarking a specific doctor they want to remember or revisit later.
 *
 * Think of it like adding a doctor to a "Favorites" list. When a user clicks the
 * bookmark/heart icon on a doctor's profile, it creates a document here.
 *
 * Each bookmark links:
 *   - A User  (who bookmarked)
 *   - A Doctor (who was bookmarked)
 *   - Optionally, a SavedLocation (their preferred location when visiting that doctor)
 */

import { Schema, model } from "mongoose";

const bookmarkSchema = new Schema(
  {
    // The user who created this bookmark (logged-in user's ID).
    // Required because every bookmark must belong to someone.
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The doctor being bookmarked/saved.
    // Required — a bookmark without a doctor doesn't make sense.
    // When fetched, this gets populated with full doctor details (name, specialization, etc.)
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // (Optional) A saved location associated with this bookmark.
    // For example, the user might bookmark Dr. Smith AND save "Home" as their
    // preferred pickup location when visiting this doctor.
    // If not set, defaults to null.
    savedLocation: {
      type: Schema.Types.ObjectId,
      ref: "SavedLocation",
      default: null,
    },
  },
  {
    // Automatically adds "createdAt" and "updatedAt" fields.
    // "createdAt" tells us when the user saved this doctor.
    timestamps: true,
  }
);

// ── Database Indexes ─────────────────────────────────────────────────────────

// Compound unique index: prevents a user from bookmarking the same doctor twice.
// If User A tries to bookmark Doctor B again, the database rejects it.
bookmarkSchema.index({ user: 1, doctor: 1 }, { unique: true });

// Index for efficiently fetching all bookmarks of a user, sorted by newest first.
bookmarkSchema.index({ user: 1, createdAt: -1 });

// Export the model — this creates the "bookmarks" collection in MongoDB
export default model("Bookmark", bookmarkSchema);