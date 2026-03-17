import {
  canonicalSpecializations,
  getFallbackSpecialization,
} from "./ai.specialization.js";

export const ALLOWED_SPECIALISTS = canonicalSpecializations.map(
  (item) => item.name
);

export const FALLBACK_SPECIALIST =
  getFallbackSpecialization()?.name || "General Medicine";

export const DEFAULT_WARNING =
  "This result is only for specialist recommendation support and is not a medical diagnosis.";

export const HIGH_RISK_KEYWORDS = [
  // English
  "chest pain",
  "shortness of breath",
  "difficulty breathing",
  "severe bleeding",
  "unconscious",
  "seizure",
  "stroke",
  "slurred speech",
  "one-sided weakness",
  "fainting",
  "suicidal",
  "suicide",
  "heart attack",

  // Bangla
  "বুক ব্যথা",
  "শ্বাস কষ্ট",
  "শ্বাস নিতে কষ্ট",
  "রক্তপাত",
  "অজ্ঞান",
  "খিঁচুনি",
  "স্ট্রোক",
  "কথা জড়িয়ে যাচ্ছে",
  "একপাশ অবশ",
  "মূর্ছা",
  "আত্মহত্যা",

  // Banglish
  "buk betha",
  "shash kosto",
  "shash nite kosto",
  "rokto pora",
  "ogyan",
  "khichuni",
  "stroke",
  "kotha jorano",
  "ekpash obosh",
  "faint",
  "suicide",
];