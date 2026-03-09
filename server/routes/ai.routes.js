import express from "express";
import {
  healthCheckGrok,
} from "../controllers/ai.controller.js";
import { testEmbedding }  from "../providers/ai/embedding.provider.js";
import { testMainAI }  from "../providers/ai/analysis.provider.js";
import { testGateKeeper }  from "../providers/ai/gateKeeper.provider.js";


const router = express.Router();

router.get("/health", healthCheckGrok);
router.get("/testEmbedding", testEmbedding);
router.get("/testAnalysis", testMainAI);
router.get("/testGateKeeper", testGateKeeper);

export default router;