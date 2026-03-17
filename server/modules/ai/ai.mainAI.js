import { callGroq, safeJsonParse } from "./ai.groq.js";

const MAIN_MODEL = process.env.GROQ_MAIN_MODEL || "llama-3.1-8b-instant";

function truncateText(text, maxLength = 3500) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function normalizeUrgency(value = "") {
  const v = String(value).toLowerCase().trim();
  if (["low", "medium", "high", "emergency"].includes(v)) return v;
  return "medium";
}

function getFallbackExplanation(specialist) {
  return `Based on the provided symptom description and retrieved medical context, ${specialist} is an appropriate initial specialist recommendation.`;
}

function getFallbackWarning() {
  return "This is not a medical diagnosis. Seek urgent care if symptoms become severe or worsen quickly.";
}

function extractStringField(raw = "", fieldName) {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, "is");
  const match = raw.match(regex);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

function extractArrayField(raw = "", fieldName) {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*\\[(.*?)\\]`, "is");
  const match = raw.match(regex);

  if (!match) return [];

  return match[1]
    .split(",")
    .map((item) => item.replace(/["\n\r\t]/g, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

function recoverMainAIFields(raw = "") {
  return {
    specialist: extractStringField(raw, "specialist"),
    explanation: extractStringField(raw, "explanation"),
    urgency: extractStringField(raw, "urgency"),
    warningMessage: extractStringField(raw, "warningMessage"),
    matchedSymptoms: extractArrayField(raw, "matchedSymptoms"),
  };
}

function fallbackMainAI({ symptoms, recovered = {} }) {
  const specialist =
    recovered.specialist && recovered.specialist.trim()
      ? recovered.specialist.trim()
      : "General Physician";

  return {
    specialist,
    explanation:
      recovered.explanation && recovered.explanation.trim()
        ? recovered.explanation.trim()
        : getFallbackExplanation(specialist),
    urgency: normalizeUrgency(recovered.urgency),
    warningMessage:
      recovered.warningMessage && recovered.warningMessage.trim()
        ? recovered.warningMessage.trim()
        : getFallbackWarning(),
    matchedSymptoms:
      Array.isArray(recovered.matchedSymptoms) && recovered.matchedSymptoms.length
        ? recovered.matchedSymptoms
        : symptoms
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 5),
  };
}

export async function runMainAI({
  symptoms,
  originalSymptoms,
  inputLanguage,
  contextText,
}) {
  const safeContextText = truncateText(contextText, 3500);

  try {
    const raw = await callGroq({
      model: MAIN_MODEL,
      temperature: 0,
      max_tokens: 220,
      response_format: { type: "json_object" },
      label: "Groq main AI",
      messages: [
        {
          role: "system",
          content: `
You are CareFind's grounded specialist recommendation engine.

Your task:
1. Understand the user's symptom description.
2. Use the retrieved medical context as the basis for your recommendation.
3. Recommend the most appropriate specialist.
4. Return a short 2/3 sentence explanation in English.
5. Keep specialist name in standardized English.
6. Return ONLY one valid JSON object.

Rules:
- No markdown
- No code fences
- No extra text
- explanation must be short
- warningMessage must be short
- matchedSymptoms must contain at most 3 short items
- urgency must be one of: low, medium, high, emergency

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
Original symptoms: ${originalSymptoms || symptoms}
Cleaned symptoms: ${symptoms}
Input language: ${inputLanguage}

Retrieved medical context:
${safeContextText}
          `.trim(),
        },
      ],
    });

    console.log("Main AI raw output:", raw);

    const parsed = safeJsonParse(raw);
    console.log(parsed);
    

    return fallbackMainAI({
      symptoms,
      recovered: {
        specialist: String(parsed.specialist || "").trim(),
        explanation: String(parsed.explanation || "").trim(),
        urgency: String(parsed.urgency || "").trim(),
        warningMessage: String(parsed.warningMessage || "").trim(),
        matchedSymptoms: Array.isArray(parsed.matchedSymptoms)
          ? parsed.matchedSymptoms
              .map((item) => String(item).trim())
              .filter(Boolean)
          : [],
      },
    });
  } catch (error) {
    console.warn("Main AI failed, attempting partial recovery:", error.message);

    const raw = error?.rawOutput || error?.raw || error?.message || "";
    const recovered = recoverMainAIFields(raw);

    return fallbackMainAI({
      symptoms,
      recovered,
    });
  }
}