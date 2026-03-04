// server/validators/authSchemas.js
import { z } from "zod";

/**
 * NOTE on "password freedom":
 * This does NOT force strong passwords.
 * It only prevents empty/insanely long inputs + bad types.
 * You can loosen/tighten these anytime.
 */

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(80, "Name too long"),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email")
    .max(254, "Email too long"),

  // Freedom-friendly: allow weak passwords, but disallow empty and absurd length
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .max(200, "Password too long"),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email")
    .max(254, "Email too long"),

  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .max(200, "Password too long"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email().max(254),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const resendVerifySchema = z.object({
  email: z.string().trim().email().max(254),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(254),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email().max(254),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must be 6 digits"),
  password: z.string().min(1).max(200), // keep your “freedom” rule
});