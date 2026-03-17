import express from "express";
import {aiHealthController,analyzeSymptomsController} from "../controllers/ai.controller.js";
import { protect } from "../middleware/authMiddleware.js";



const router = express.Router();

router.get("/health", aiHealthController);
router.post("/analyze",protect, analyzeSymptomsController);



export default router;