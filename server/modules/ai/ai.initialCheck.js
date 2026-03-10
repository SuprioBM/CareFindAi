import { z } from "zod";

const symptomInputSchema = z.object({
  symptoms: z
    .string()
    .trim()
    .min(5, "Please enter a more detailed symptom description.")
    .max(700, "Symptom description is too long."),
  language: z.string().optional().default("auto"),
});

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function looksLikeSpam(text) {
  const lower = text.toLowerCase();

  if (/^(.)\1{5,}$/.test(lower)) return true; // aaaaaaa
  if (/^\d+$/.test(lower)) return true; // only numbers
  if (/^[^a-zA-Z]+$/.test(lower)) return true; // only symbols
  if (lower.split(" ").length === 1 && lower.length < 5) return true;

  return false;
}

function looksObviouslyNonMedical(text) {
  const lower = text.toLowerCase();

  const blocked = [
    "write a poem",
    "tell me a joke",
    "who are you",
    "make me code",
    "ignore previous instructions",
    "act as chatgpt",
    "hello bro",
    "how are you",
  ];

  return blocked.some((item) => lower.includes(item));
}

export function runInitialCheck(body) {
  const parsed = symptomInputSchema.safeParse(body);

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      message: parsed.error.issues[0]?.message || "Invalid input.",
    };
  }

  const cleanedText = normalizeText(parsed.data.symptoms);

  if (looksLikeSpam(cleanedText)) {
    return {
      ok: false,
      status: 400,
      message: "Please enter valid symptoms or a health-related concern.",
    };
  }

  if (looksObviouslyNonMedical(cleanedText)) {
    return {
      ok: false,
      status: 400,
      message: "Please enter symptoms or a health-related concern.",
    };
  }

  return {
    ok: true,
    data: {
      symptoms: cleanedText,
      language: parsed.data.language || "auto",
    },
  };
}