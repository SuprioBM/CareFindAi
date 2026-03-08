import { Schema, model } from "mongoose";

const bookmarkSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    savedLocation: {
      type: Schema.Types.ObjectId,
      ref: "SavedLocation",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.index({ user: 1, doctor: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });

export default model("Bookmark", bookmarkSchema);