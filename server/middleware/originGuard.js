// server/middleware/originGuard.js
export function originGuard(req, res, next) {
  const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

  // For same-site requests, browsers usually send Origin on POST/fetch.
  const origin = req.headers.origin;

  // If no origin (e.g., mobile app / curl), allow it OR block it based on your needs.
  // For now: allow missing origin to avoid breaking non-browser clients.
  if (!origin) return next();

  if (origin !== allowedOrigin) {
    return res.status(403).json({
      success: false,
      message: "CSRF blocked (invalid origin)",
    });
  }

  return next();
}
