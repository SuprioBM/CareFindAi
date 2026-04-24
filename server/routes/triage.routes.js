import express from "express";
import { handleTriageMessage, startTriage } from "../controllers/triage.controller.js";
import { getSession, deleteSession, resetSession } from "../controllers/session.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { sanitizeInput } from "../middleware/sanitize.middleware.js";
import { rateLimit } from "../middleware/rateLimit.middleware.js";
import { triageMessageSchema, triageStartSchema } from "../validators/triage.validator.js";

const router = express.Router();

router.post("/message",
    validate(triageMessageSchema),
    sanitizeInput,
    rateLimit(30),
    handleTriageMessage);
router.post("/start",
    validate(triageStartSchema),
    sanitizeInput,
    rateLimit(30),
    startTriage);
router.get("/session/:sessionId", getSession);
router.post("/session/:sessionId/reset", resetSession);
router.delete("/session/:sessionId", deleteSession);

export default router;