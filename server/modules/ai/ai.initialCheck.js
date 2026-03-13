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

function detectLanguage(text) {
  // Bangla Unicode block
  if (/[\u0980-\u09FF]/u.test(text)) return "bn";
  return "en";
}

function looksLikeSpam(text) {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();

  if (/^(.)\1{5,}$/u.test(lower)) return true; // aaaaaaa / একই অক্ষর অনেকবার
  if (/^\d+$/u.test(lower)) return true; // only numbers

  // only symbols / punctuation, but allows letters from Bangla + English + other languages
  if (/^[^\p{L}\p{N}\s]+$/u.test(lower)) return true;

  // single very short token like "hi", "??", "ok"
  if (normalized.split(/\s+/).length === 1 && normalized.length < 3) return true;

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
    "write an essay",
    "tell me story",
    "generate code",
    "pretend to be",
    "system prompt",
    "developer prompt",
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
      language:
        parsed.data.language === "auto"
          ? detectLanguage(cleanedText)
          : parsed.data.language || "auto",
    },
  };
}