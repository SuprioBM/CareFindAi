import { callOpenRouter, safeJsonParse } from "./ai.openRouter.js";

const GATEKEEPER_MODEL =
  process.env.OPENROUTER_GATEKEEPER_MODEL || "openrouter/free";

function fallbackGatekeeper(userInput) {
  const lower = userInput.toLowerCase();

  const blockedPatterns = [
    "write a poem",
    "tell me a joke",
    "ignore previous instructions",
    "act like chatgpt",
    "who are you",
    "hello",
    "hi",
    "how are you",
    "write code",
  ];

  const blocked = blockedPatterns.some((item) => lower.includes(item));

  return {
    allowed: !blocked,
    category: blocked ? "non_medical" : "medical_symptom",
    cleaned_query: userInput.trim(),
    reason: blocked
      ? "Rule-based fallback rejected non-medical input"
      : "Rule-based fallback accepted symptom-like input",
  };
}

export async function runGatekeeperAI(userInput) {
  try {
    const raw = await callOpenRouter({
      model: GATEKEEPER_MODEL,
      temperature: 0,
      max_tokens: 120,
      response_format: { type: "json_object" },
      reasoning: {
        effort: "none",
        exclude: true,
      },
      messages: [
        {
          role: "system",
          content: `
You are a strict classifier for CareFind.

Return ONLY one valid JSON object.
No markdown.
No code fences.
No explanation.
No text before or after JSON.

Schema:
{
  "allowed": true,
  "category": "medical_symptom",
  "cleaned_query": "example",
  "reason": "example"
}

Allowed category values:
- medical_symptom
- medical_question
- non_medical
- unsafe
          `.trim(),
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    console.log("Gatekeeper raw output:", raw);

    const parsed = safeJsonParse(raw);

    return {
      allowed: Boolean(parsed.allowed),
      category: parsed.category || "non_medical",
      cleaned_query: String(parsed.cleaned_query || "").trim(),
      reason: String(parsed.reason || "").trim(),
    };
  } catch (error) {
    console.warn("Gatekeeper AI failed, using fallback:", error.message);
    return fallbackGatekeeper(userInput);
  }
}