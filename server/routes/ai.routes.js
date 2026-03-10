import express from "express";
import {aiHealthController,analyzeSymptomsController} from "../controllers/ai.controller.js";



const router = express.Router();

router.get("/health", aiHealthController);
router.post("/analyze", analyzeSymptomsController);


export default router;