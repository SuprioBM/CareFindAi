import express from "express";
import {
  createSymptomSearch,
  getMySymptomSearches,
  getSymptomSearchById,
  deleteSymptomSearch,
} from "../controllers/symptomSearch.controller.js";

const router = express.Router();

router.post("/", createSymptomSearch);
router.get("/", getMySymptomSearches);
router.get("/:id", getSymptomSearchById);
router.delete("/:id", deleteSymptomSearch);

export default router;