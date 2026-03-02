import jwt from "jsonwebtoken";
import { getRedis } from "../config/redis.js";


const ACCESS_EXP = "5m"; // short-lived
const REFRESH_EXP = 7 * 24 * 60 * 60; // 7 days in seconds

// ===================== Middleware: Protect routes =====================
export async function protect(req, res, next) {
  const redis = getRedis();
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
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token provided" });

    // Check refresh token in Redis
    const sessionStr = await redis.get(`sess:${refreshToken}`);
    if (!sessionStr)
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    
    const session = JSON.parse(sessionStr);
    
    const { userID, name, email } = session;

    // ✅ Rotate refresh token
    const newRefreshToken = jwt.sign({ userID }, process.env.JWT_SECRET, {
      expiresIn: REFRESH_EXP,
    });
    const newAccessToken = jwt.sign(
      { id: userID, email: email, name: name },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_EXP },
    );

    // Save new refresh token in Redis, delete old one
    await redis.del(`sess:${refreshToken}`);
    await redis.set(`sess:${newRefreshToken}`, JSON.stringify({ userID, email, name }), {
      EX: REFRESH_EXP,
    });

    // Send refresh token as HttpOnly cookie
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_EXP * 1000,
    });

    // Send access token in response body (frontend stores in memory)
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
