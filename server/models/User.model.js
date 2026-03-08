import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // ✅ single password field (null allowed for Google users)
    password: { type: String, default: null },

    // provider linking
    googleSub: { type: String, default: null, index: true, sparse: true },
    authProvider: { type: String, default: "local" }, // "local" | "google"

    // email verification (OTP)
    emailVerified: { type: Boolean, default: false },
    emailVerifyCodeHash: { type: String, default: null },
    emailVerifyCodeExp: { type: Date, default: null },
    emailVerifyCodeAttempts: { type: Number, default: 0 },
    emailVerifyLastSentAt: { type: Date, default: null },

    // password reset (OTP)
    passwordResetCodeHash: { type: String, default: null },
    passwordResetCodeExp: { type: Date, default: null },
    passwordResetAttempts: { type: Number, default: 0 },
    passwordResetLastSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default model("User", userSchema);
