import express from "express";
import {
  createSavedLocation,
  getMySavedLocations,
  getSavedLocationById,
  updateSavedLocation,
  deleteSavedLocation,
} from "../controllers/savedLocation.controller.js";

const router = express.Router();

router.post("/", createSavedLocation);
router.get("/", getMySavedLocations);
router.get("/:id", getSavedLocationById);
router.patch("/:id", updateSavedLocation);
router.delete("/:id", deleteSavedLocation);

export default router;