import express from "express";
import {
  healthCheckGrok,
} from "../controllers/ai.controller.js";
import { testMainAI }  from "../providers/ai/analysis.provider.js";
import { testGatekeeper } from "../providers/ai/gateKeeper.provider.js";


const router = express.Router();

router.get("/health", healthCheckGrok);
router.get("/testAnalysis", testMainAI);
router.get("/testgatekeeper", testGatekeeper);

export default router;