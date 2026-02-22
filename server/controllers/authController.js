import User from "../models/User.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import redis from "../config/redis.js";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_EXP = "3m"; // short-lived access token
const REFRESH_EXP = 7 * 24 * 60 * 60; // 7 days in seconds

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

    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ========== LOGIN ========== */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isValid = await argon2.verify(user.password, password);
    if (!isValid)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate refresh token (long-lived)
    const refreshToken = crypto.randomBytes(32).toString("hex");

    // Store refresh token in Redis with user info
    await redis.set(
      `sess:${refreshToken}`,
      JSON.stringify({ userID: user._id, name: user.name, email: user.email }),
      { EX: REFRESH_EXP },
    );

    // Generate short-lived access token (JWT)
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_EXP },
    );
   
     

    // Send refresh token as HttpOnly cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_EXP * 1000,
    }).json({
      message: "Login successful",
      accessToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/* ========== LOGOUT ========== */
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken)
      return res.status(200).json({ message: "Already logged out" });

    // Delete refresh token from Redis
    await redis.del(`sess:${refreshToken}`);

    // Clear refresh token cookie
    res
      .clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logout failed" });
  }
}
