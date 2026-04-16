import express from "express";
import {
  createSavedLocation,
  getMySavedLocations,
  getSavedLocationById,
  updateSavedLocation,
  deleteSavedLocation,
} from "../controllers/savedLocation.controller.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",protect, createSavedLocation);
router.get("/", protect, getMySavedLocations);
router.get("/:id", protect, getSavedLocationById);
router.patch("/:id", protect, updateSavedLocation);
router.delete("/:id", protect, deleteSavedLocation);

export default router;