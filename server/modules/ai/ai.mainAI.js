import { callOpenRouter, safeJsonParse } from "./ai.openRouter.js";

const MAIN_MODEL = process.env.OPENROUTER_MAIN_MODEL || "openrouter/free";

function truncateText(text, maxLength = 5000) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function fallbackMainAI(symptoms) {
  return {
    specialist: "General Physician",
    explanation:
      "Based on the provided symptom description, a general physician is the safest initial specialist recommendation.",
    urgency: "medium",
    warningMessage:
      "This result is only for specialist recommendation support and is not a medical diagnosis.",
    matchedSymptoms: symptoms
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5),
  };
}

export async function runMainAI({ symptoms, contextText }) {
  try {
    const safeContextText = truncateText(contextText, 5000);

    const raw = await callOpenRouter({
      model: MAIN_MODEL,
      temperature: 0.1,
      max_tokens: 260,
      response_format: { type: "json_object" },
      reasoning: {
        effort: "none",
        exclude: true,
      },
      messages: [
        {
          role: "system",
          content: `
You are CareFind's specialist recommendation engine.

Return ONLY one valid JSON object.
No markdown.
No code fences.
No explanation outside JSON.

Return exactly:
{
  "specialist": "string",
  "explanation": "string",
  "urgency": "low | medium | high | emergency",
  "warningMessage": "string",
  "matchedSymptoms": ["string"]
}
          `.trim(),
        },
        {
          role: "user",
          content: `
User symptoms:
${symptoms}

Retrieved medical context:
${safeContextText}
          `.trim(),
        },
      ],
    });

    console.log("Main AI raw output:", raw);

    const parsed = safeJsonParse(raw);

    return {
      specialist: String(parsed.specialist || "").trim(),
      explanation: String(parsed.explanation || "").trim(),
      urgency: String(parsed.urgency || "").trim(),
      warningMessage: String(parsed.warningMessage || "").trim(),
      matchedSymptoms: Array.isArray(parsed.matchedSymptoms)
        ? parsed.matchedSymptoms.map((item) => String(item))
        : [],
    };
  } catch (error) {
    console.warn("Main AI failed, using fallback:", error.message);
    return fallbackMainAI(symptoms);
  }
}