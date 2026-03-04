import jwt from "jsonwebtoken";
import { getRedis } from "../config/redis.js";
import { generateOtp, hashOtp } from "../utils/emailOtp.js";
import { sendVerificationEmail } from "./sendEmail.js";
import crypto from "crypto";
import User from "../models/User.js";


const ACCESS_EXP = "5m"; // short-lived
const REFRESH_EXP = 7 * 24 * 60 * 60; // 7 days in seconds

// ===================== Helpers for session management =====================
async function revokeAllSessions(redis, userID) {
  const setKey = `userSessions:${userID}`;
  const sids = await redis.sMembers(setKey);

  for (const sid of sids) {
    const currentRt = await redis.get(`sid:${sid}`);
    if (currentRt) await redis.del(`sess:${currentRt}`);
    await redis.del(`sid:${sid}`);
  }

  await redis.del(setKey);
}
// ===================== Middleware: Protect routes =====================
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const accessToken = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Access token expired or invalid" });
    }

    req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// ===================== Refresh token handler =====================
export async function refresh(req, res) {
  const redis = getRedis();

  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // 1) Does this refresh token exist?
    const sessionStr = await redis.get(`sess:${refreshToken}`);
    if (!sessionStr) {
      // token not found — clear cookie
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    const session = JSON.parse(sessionStr);
    const { userID, sid, name, email } = session;

    // 2) Reuse detection: is this token the CURRENT one for this sid?
    const currentTokenForSid = await redis.get(`sid:${sid}`);

    if (!currentTokenForSid) {
      // sid missing -> suspicious; revoke all
      await revokeAllSessions(redis, userID);
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return res
        .status(401)
        .json({ message: "Session invalid. Please login again." });
    }

    if (currentTokenForSid !== refreshToken) {
      // 🚨 token reuse detected → revoke all sessions for safety
      await revokeAllSessions(redis, userID);

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.status(401).json({
        message:
          "Refresh token reuse detected. Logged out everywhere. Please login again.",
      });
    }

    // 3) Rotate: new refresh token
    const newRefreshToken = crypto.randomBytes(32).toString("hex");

    const newAccessToken = jwt.sign(
      { id: userID, email, name },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_EXP },
    );

    // 4) Update Redis (use MULTI to reduce race issues)
    const multi = redis.multi();

    // new token session
    multi.set(
      `sess:${newRefreshToken}`,
      JSON.stringify({ userID, sid, name, email }),
      { EX: REFRESH_EXP },
    );

    // update sid -> new token
    multi.set(`sid:${sid}`, newRefreshToken, { EX: REFRESH_EXP });

    // delete old token mapping
    multi.del(`sess:${refreshToken}`);

    await multi.exec();

    // 5) Set new cookie
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: REFRESH_EXP * 1000,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;
    const e = email.toLowerCase().trim();

    const user = await User.findOne({ email: e });
    if (!user)
      return res.status(400).json({ message: "Invalid code or email" });

    if (user.emailVerified) {
      return res.json({ message: "Email already verified" });
    }

    if (!user.emailVerifyCodeHash || !user.emailVerifyCodeExp) {
      return res.status(400).json({ message: "No code found. Please resend." });
    }

    if (user.emailVerifyCodeExp.getTime() < Date.now()) {
      return res.status(400).json({ message: "Code expired. Please resend." });
    }

    if ((user.emailVerifyCodeAttempts || 0) >= 5) {
      return res
        .status(429)
        .json({ message: "Too many attempts. Please resend a new code." });
    }

    const ok = hashOtp(code) === user.emailVerifyCodeHash;
    if (!ok) {
      user.emailVerifyCodeAttempts = (user.emailVerifyCodeAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Invalid code or email" });
    }

    user.emailVerified = true;
    user.emailVerifyCodeHash = null;
    user.emailVerifyCodeExp = null;
    user.emailVerifyCodeAttempts = 0;
    user.emailVerifyLastSentAt = null;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    const e = email.toLowerCase().trim();

    const user = await User.findOne({ email: e });

    // Don’t reveal if email exists
    if (!user) {
      return res.json({ message: "If that email exists, we sent a new code." });
    }

    if (user.emailVerified) {
      return res.json({ message: "Email already verified" });
    }

    // Cooldown: 60 seconds
    const last = user.emailVerifyLastSentAt?.getTime() || 0;
    if (Date.now() - last < 60 * 1000) {
      return res.status(429).json({
        message: "Please wait a minute before requesting another code.",
      });
    }

    const OTP_MIN = Number(process.env.OTP_EXP_MIN || 10);
    const code = generateOtp();

    user.emailVerifyCodeHash = hashOtp(code);
    user.emailVerifyCodeExp = new Date(Date.now() + OTP_MIN * 60 * 1000);
    user.emailVerifyCodeAttempts = 0;
    user.emailVerifyLastSentAt = new Date();
    await user.save();

    await sendVerificationEmail({ to: user.email, code });

    return res.json({ message: "If that email exists, we sent a new code." });
  } catch (err) {
    console.error("resendVerification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
