import express from "express";
import { register, login, logout,forgotPassword,resetPassword } from "../controllers/auth.controller.js";
import { protect, refresh,verifyEmail,resendVerification, verifyResetCode } from "../middleware/authMiddleware.js";
import { checkLockout } from "../middleware/lockout.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema,verifyEmailSchema,resendVerifySchema,forgotPasswordSchema,resetPasswordSchema } from "../validators/authSchemas.js";
import { arcjetProtect } from "../middleware/arcjetProtect.js";
import { originGuard } from "../middleware/originGuard.js";
import {
  googleStart,
  googleCallback,
  googleExchange,
} from "../controllers/googleAuth.controller.js";

import {
  getSessions,
  revokeSession,
  revokeAllSessions,
} from "../middleware/sessionController.js";
import { requireAdmin } from "../middleware/authGuards.js";

const router = express.Router();

// Register
router.post(
  "/register",
  arcjetProtect({ requested: 5 }),
  validate(registerSchema),
  register,
);

// Login
router.post(
  "/login",
  arcjetProtect({ requested: 5 }),
  validate(loginSchema),
  checkLockout,
  login,
);
router.post("/logout", originGuard, logout);
router.post("/refresh", refresh);

// Example protected route
router.get("/me", protect, (req, res) => {
  
  res.json({ userID: req.user.id, email: req.user.email, name: req.user.name });
});

router.get("/admin",protect,requireAdmin,(req, res) => {
  
  res.json({success:true, userID: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role });
});

router.post(
  "/verify-email",
  arcjetProtect({ requested: 2 }),
  validate(verifyEmailSchema),
  verifyEmail,
);

router.post(
  "/resend-verification",
  arcjetProtect({ requested: 3 }),
  validate(resendVerifySchema),
  resendVerification,
);

router.post(
  "/forgot-password",
  arcjetProtect({ requested: 3 }),
  validate(forgotPasswordSchema),
  forgotPassword,
);

router.post(
  "/reset-password",
  arcjetProtect({ requested: 3 }),
  validate(resetPasswordSchema),
  resetPassword,
);

router.post(
  "/verify-reset-code",
   validate(verifyEmailSchema), 
  verifyResetCode, 
)

// Google OAuth redirect flow
router.get("/google/start", arcjetProtect({ requested: 2 }), googleStart);
router.get("/google/callback", arcjetProtect({ requested: 2 }), googleCallback);
router.post("/google/exchange", googleExchange);




router.get("/sessions", protect, getSessions);
router.delete("/sessions/:sid", protect, revokeSession);
router.delete("/sessions", protect, revokeAllSessions);

export default router;
