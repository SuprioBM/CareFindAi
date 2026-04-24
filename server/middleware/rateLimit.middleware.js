const requests = new Map();

/**
 * SIMPLE RATE LIMITER (per IP)
 * Upgrade later → Redis-based limiter
 */
export const rateLimit = (limit = 20, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    const userData = requests.get(ip) || {
      count: 0,
      startTime: now
    };

    if (now - userData.startTime > windowMs) {
      userData.count = 0;
      userData.startTime = now;
    }

    userData.count++;

    requests.set(ip, userData);

    if (userData.count > limit) {
      return res.status(429).json({
        triage_level: "LOW",
        confidence: 0,
        domains: {},
        reasons: ["Too many requests. Please slow down."],
        next_step: "Wait and retry",
        specialties: ["General Physician"]
      });
    }

    next();
  };
};