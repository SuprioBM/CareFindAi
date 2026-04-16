import express from "express";
import { getAnalytics } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/authGuards.js";

const router = express.Router();

router.get("/", protect,requireAdmin, getAnalytics);

export default router;