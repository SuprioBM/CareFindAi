import User from "../models/User.model.js";
import argon2 from "argon2";
import { getRedis } from "../config/redis.js";
import { recordFail, resetFail } from "../middleware/lockout.js";
import { generateOtp, hashOtp } from "../utils/emailOtp.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../middleware/sendEmail.js";
import { issueSession, revokeAllSessionsForUser } from "../utils/manageSessions.js";
import { getRefreshCookieOptions } from "../utils/cookies.js";



/* ========== REGISTER ========== */
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const OTP_MIN = 10;
    const code = generateOtp();

    user.emailVerified = false;
    user.emailVerifyCodeHash = hashOtp(code);
    user.emailVerifyCodeExp = new Date(Date.now() + OTP_MIN * 60 * 1000);
    user.emailVerifyCodeAttempts = 0;
    user.emailVerifyLastSentAt = new Date();
    await user.save();

    
    await sendVerificationEmail({ to: user.email, code });

    return res.status(201).json({
      message: "Registered. Check your email for the verification code.",
      next: "VERIFY_EMAIL",
      email: user.email,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ========== LOGIN ========== */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // IMPORTANT: email is stored lowercase/trim in schema, so normalize here too
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Google-only account protection
    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Use Google login for this account." });
    }

    // Block login if not verified
    if (!user.emailVerified) {
      return res.status(403).json({ user: { email: user.email, isVerified: user.emailVerified },
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email first",
      });
    }

    const isValid = await argon2.verify(user.password, password);
    if (!isValid) {
      const lockedNow = await recordFail(normalizedEmail);
      return res.status(401).json({
        message: lockedNow
          ? "Too many failed attempts. Account locked temporarily."
          : "Invalid credentials",
      });
    }

    // success
    await resetFail(normalizedEmail);

    // ✅ Create refresh session in Redis + set cookie + create access token
    const session = await issueSession(req,res, user);

    return res.json({
      message: "Login successful",
      ...session, // { accessToken, user }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
/* ========== LOGOUT ========== */
export async function logout(req, res) {
  const redis = getRedis();
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken)
      return res.status(200).json({ message: "Already logged out" });

    // Delete refresh token from Redis
    const sessionStr = await redis.get(`sess:${refreshToken}`);
    if (sessionStr) {
      const { userID, sid } = JSON.parse(sessionStr);

      // remove session mappings
      await redis.del(`sess:${refreshToken}`);
      await redis.del(`sid:${sid}`);
      await redis.sRem(`userSessions:${userID}`, sid);
    }

    // Clear refresh token cookie
    res
      .clearCookie("refresh_token", getRefreshCookieOptions())
      .json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
  }
}

// ===================== Forgot & Reset Password =====================
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const e = email.toLowerCase().trim();

    const user = await User.findOne({ email: e });

    // Always return the same message (don’t reveal existence)
    const genericMsg = {
      message: "If that email exists, we sent a reset code.",
    };

    if (!user) return res.json(genericMsg);

    // Cooldown: 60s between sends
    const last = user.passwordResetLastSentAt?.getTime() || 0;
    if (Date.now() - last < 60 * 1000) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another code.",
      });
    }

    const OTP_MIN = Number(process.env.OTP_EXP_MIN || 10);
    const code = generateOtp();

    user.passwordResetCodeHash = hashOtp(code);
    user.passwordResetCodeExp = new Date(Date.now() + OTP_MIN * 60 * 1000);
    user.passwordResetAttempts = 0;
    user.passwordResetLastSentAt = new Date();
    user.passwordResetverified = false;
    user.passwordResetVerifiedAt = null;
    await user.save();

    await sendPasswordResetEmail({ to: user.email, code });

    return res.json(genericMsg);
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// This is called when user submits the code and new password

export async function resetPassword(req, res) {
  try {
    const { email, password } = req.body;
    const e = email.toLowerCase().trim();

    const user = await User.findOne({ email: e });
    if (!user) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    if (!user.passwordResetverified || !user.passwordResetVerifiedAt) {
      return res.status(403).json({
        message: "Please verify your reset code first.",
      });
    }

    // Verification should be recent
    const VERIFIED_WINDOW_MIN = 10;
    const verifiedTooOld =
      Date.now() - user.passwordResetVerifiedAt.getTime() >
      VERIFIED_WINDOW_MIN * 60 * 1000;

    if (verifiedTooOld) {
      user.passwordResetverified = false;
      user.passwordResetVerifiedAt = null;
      await user.save();

      return res.status(400).json({
        message: "Reset session expired. Please verify again.",
      });
    }

    const hashedPassword = await argon2.hash(password);
    user.password = hashedPassword;

    // Clear all reset-related fields
    user.passwordResetCodeHash = null;
    user.passwordResetCodeExp = null;
    user.passwordResetAttempts = 0;
    user.passwordResetLastSentAt = null;
    user.passwordResetverified = false;
    user.passwordResetVerifiedAt = null;

    await user.save();

    await revokeAllSessionsForUser(user._id.toString());

    res.clearCookie("refresh_token", getRefreshCookieOptions());

    return res.json({
      message: "Password reset successful. Please login again.",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}