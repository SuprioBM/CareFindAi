import { z } from "zod";

const ALLOWED_LANGUAGES = ["auto", "en", "bn", "banglish"];

const symptomInputSchema = z.object({
  symptoms: z
    .string()
    .trim()
    .min(5, "Please enter a more detailed symptom description.")
    .max(700, "Symptom description is too long."),
  language: z
    .string()
    .optional()
    .default("auto")
    .transform((v) => (v || "auto").toLowerCase())
    .refine((v) => ALLOWED_LANGUAGES.includes(v), {
      message: "Language must be one of: auto, en, bn, banglish",
    }),
});

function normalizeWhitespace(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function stripTrailingLanguageTag(text = "") {
  return String(text).replace(/\s+\b(en|bn|banglish)\b$/i, "").trim();
}

function normalizeText(text = "") {
  return normalizeWhitespace(stripTrailingLanguageTag(text));
}

function detectLanguage(text = "") {
  const cleaned = normalizeText(text);
  const lower = cleaned.toLowerCase();

  if (/[\u0980-\u09FF]/u.test(cleaned)) return "bn";

  const banglishPatterns = [
    /\bami\b/,
    /\bamr\b/,
    /\bamar\b/,
    /\bgola(i|y)?\b/,
    /\bbetha\b/,
    /\bbyatha\b/,
    /\bjor\b/,
    /\bjhor\b/,
    /\bkashi\b/,
    /\bmatha\b/,
    /\bpet\b/,
    /\bbuk\b/,
    /\bbomi\b/,
    /\bshash\b/,
    /\bshordi\b/,
    /\bjala\b/,
    /\boshubidha\b/,
    /\bkrse\b/,
    /\bhocche\b/,
    /\bhoise\b/,
    /\blagche\b/,
    /\bashche\b/,
  ];

  const banglishScore = banglishPatterns.reduce(
    (count, pattern) => count + (pattern.test(lower) ? 1 : 0),
    0
  );

  if (banglishScore >= 1) return "banglish";

  return "en";
}

function looksLikeSpam(text = "") {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();

  if (!normalized) return true;
  if (/^(.)\1{5,}$/u.test(lower)) return true;
  if (/^\d+$/u.test(lower)) return true;
  if (/^[^\p{L}\p{N}\s]+$/u.test(lower)) return true;

  return false;
}

function looksObviouslyNonMedical(text = "") {
  const lower = normalizeText(text).toLowerCase();

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

  const detectedLanguage =
    parsed.data.language === "auto"
      ? detectLanguage(cleanedText)
      : parsed.data.language;

  return {
    ok: true,
    data: {
      originalSymptoms: parsed.data.symptoms,
      symptoms: cleanedText,
      inputLanguage: detectedLanguage,
      responseLanguage: "en",
    },
  };
}