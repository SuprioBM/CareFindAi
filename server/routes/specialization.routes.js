import express from "express";
import {
  createSpecialization,
  getAllSpecializations,
  getSpecializationById,
  updateSpecialization,
  deleteSpecialization,
} from "../controllers/specialization.controller.js";
import { requireAdmin } from "../middleware/authGuards.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",protect,requireAdmin, createSpecialization);
router.get("/", protect,requireAdmin, getAllSpecializations);
router.get("/:id", getSpecializationById);
router.patch("/:id", protect,requireAdmin, updateSpecialization);
router.delete("/:id", protect,requireAdmin, deleteSpecialization);

export default router;