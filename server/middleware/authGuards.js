// server/middleware/authGuards.js
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // 20 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Try again later." },
});

// Slowdown kicks in after a few tries
export const authSlowdown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5, // after 5 requests
  delayMs: (hits) => (hits - 5) * 500, // +0.5s per extra hit
});



export async function requireAdmin(req, res, next) {
  try {
    
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized From Admin Guard" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}