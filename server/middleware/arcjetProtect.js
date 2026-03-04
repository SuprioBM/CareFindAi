import { aj } from "../config/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export function arcjetProtect({ requested = 1 } = {}) {
  return async (req, res, next) => {
    try {
      const decision = await aj.protect(req, { requested });

      // Block if denied
      if (decision.isDenied()) {
        if (decision.reason?.isRateLimit?.()) {
          return res
            .status(429)
            .json({ success: false, message: "Too Many Requests" });
        }
        if (decision.reason?.isBot?.()) {
          return res
            .status(403)
            .json({ success: false, message: "No bots allowed" });
        }
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      // Optional: hosting IPs often bots (be careful for legit API users!)
      if (decision.ip?.isHosting?.()) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      // Optional: detect spoofed bots
      if (decision.results?.some?.(isSpoofedBot)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
