import { z } from "zod";

/**
 * TRIAGE MESSAGE VALIDATION
 */
export const triageMessageSchema = z.object({
  sessionId: z.string().min(10).max(100),
  message: z.string().min(1).max(2000)
});

/**
 * OPTIONAL: START ENDPOINT VALIDATION
 */
export const triageStartSchema = z.object({
  text: z.string().min(1).max(2000).optional(),
  message: z.string().min(1).max(2000).optional(),
  age: z.number().int().min(0).max(120).optional(),
  gender: z.string().min(1).max(30).optional(),
  duration: z.string().min(1).max(100).optional(),
  severity: z.string().min(1).max(100).optional(),
  existingConditions: z
    .union([
      z.string().min(1).max(500),
      z.array(z.string().min(1).max(100)).max(20)
    ])
    .optional()
}).refine(
  (data) => Boolean(data.message || data.text),
  { message: "message or text is required" }
);