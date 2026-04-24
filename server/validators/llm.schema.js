import { z } from "zod";
import { DOMAIN_CONFIG } from "../config/domain.config.js";

/**
 * Confidence wrapper
 */
const ConfidenceNumber = z.object({
  value: z.number(),
  confidence: z.number().min(0).max(1),
});

const ConfidenceBoolean = z.object({
  value: z.boolean(),
  confidence: z.number().min(0).max(1),
});

const ConfidenceString = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1),
});

const ConfidenceValue = z.object({
  value: z.union([z.number(), z.boolean(), z.string()]),
  confidence: z.number().min(0).max(1),
});

const schemaByType = {
  boolean: ConfidenceBoolean,
  scale: ConfidenceNumber,
  enum: ConfidenceString,
};

const domainParameterShape = {};

for (const domain of Object.values(DOMAIN_CONFIG)) {
  for (const [key, config] of Object.entries(domain.parameters || {})) {
    if (!domainParameterShape[key]) {
      domainParameterShape[key] = (schemaByType[config.type] || ConfidenceValue).optional();
    }
  }
}

domainParameterShape.age = ConfidenceNumber.optional();
domainParameterShape.gender = ConfidenceString.optional();
domainParameterShape.duration = ConfidenceString.optional();
domainParameterShape.severity = ConfidenceString.optional();
domainParameterShape.existing_conditions = ConfidenceString.optional();

/**
 * STRICT schema with typed confidence
 */
export const LLMExtractionSchema = z.object({
  detectedSymptoms: z.array(
    z.object({
      name: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ).default([]),

  extractedData: z.object(domainParameterShape).catchall(ConfidenceValue).default({}),
});