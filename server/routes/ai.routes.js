import express from "express";
import {aiHealthController,analyzeSymptomsController,checkEmergencyController,explainRecommendationController} from "../controllers/ai.controller.js";



const router = express.Router();

router.get("/health", aiHealthController);
router.post("/analyze", analyzeSymptomsController);
router.post("/check-emergency", checkEmergencyController);
router.post("/explain-recommendation", explainRecommendationController);


export default router;