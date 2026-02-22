import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { protect, refresh } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);

// Example protected route
router.get("/me", protect, (req, res) => {
  
  res.json({ userID: req.user.id, email: req.user.email, name: req.user.name });
});

export default router;
