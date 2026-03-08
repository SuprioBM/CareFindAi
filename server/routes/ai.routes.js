import express from "express";
import {
  healthCheckGrok,
} from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/health", healthCheckGrok);

export default router;