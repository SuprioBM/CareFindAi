import express from "express";
import { handleTriageMessage, startTriage } from "../controllers/triage.controller.js";
import { getSession, deleteSession, resetSession } from "../controllers/session.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { sanitizeInput } from "../middleware/sanitize.middleware.js";
import { rateLimit } from "../middleware/rateLimit.middleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { triageMessageSchema, triageStartSchema } from "../validators/triage.validator.js";

const router = express.Router();

router.post("/message",
    protect,
    validate(triageMessageSchema),
    sanitizeInput,
    rateLimit(30),
    handleTriageMessage);
router.post("/start",
    protect,
    validate(triageStartSchema),
    sanitizeInput,
    rateLimit(30),
    startTriage);
router.get("/session/:sessionId", protect, getSession);
router.post("/session/:sessionId/reset", protect, resetSession);
router.delete("/session/:sessionId", protect, deleteSession);

export default router;