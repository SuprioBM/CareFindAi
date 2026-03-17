import express from "express";
import {
  createSymptomSearch,
  getMySymptomSearches,
  getSymptomSearchById,
  deleteSymptomSearch,
} from "../controllers/symptomSearch.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",protect, createSymptomSearch);
router.get("/", protect, getMySymptomSearches);
router.get("/:id", protect, getSymptomSearchById);
router.delete("/:id", protect, deleteSymptomSearch);

export default router;