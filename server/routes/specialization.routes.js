import express from "express";
import {
  createSpecialization,
  getAllSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
} from "../controllers/specialization.controller.js";

const router = express.Router();

router.post("/", createSpecialization);
router.get("/", getAllSpecializations);
router.get("/:id", getSpecializationById);
router.patch("/:id", updateSpecialization);
router.delete("/:id", deleteSpecialization);

export default router;