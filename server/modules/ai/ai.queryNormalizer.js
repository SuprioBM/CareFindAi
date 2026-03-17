import "dotenv/config";
import fetch from "node-fetch";
import { callGroq, safeJsonParse } from "./ai.groq.js";

const TRANSLATE_MODEL =
  process.env.GROQ_TRANSLATE_MODEL || "llama-3.1-8b-instant";

async function banglishToBangla(text) {
  const url = `https://inputtools.google.com/request?text=${encodeURIComponent(
    text
  )}&itc=bn-t-i0-und&num=1`;

  const res = await fetch(url);
  const data = await res.json();

  if (data[0] === "SUCCESS") {
    return data[1]?.[0]?.[1]?.[0] || text;
  }

  return text;
}

function fixBangla(text = "") {
  return String(text)
    .replace(/বেথা/g, "ব্যথা")
    .replace(/করসে/g, "করছে")
    .replace(/কোর্স/g, "করছে")
    .replace(/হচে/g, "হচ্ছে")
    .replace(/hocche/gi, "হচ্ছে")
    .replace(/hoise/gi, "হয়েছে")
    .replace(/korse/gi, "করছে")
    .replace(/krse/gi, "করছে")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackNormalizedQuery(text = "") {
  return String(text).trim();
}

export async function runQueryNormalizer({ symptoms, inputLanguage }) {
  const cleanedSymptoms = String(symptoms || "").trim();

  if (!cleanedSymptoms) {
    return {
      isMedical: false,
      normalizedQueryEn: "",
      normalizedSourceText: "",
      intermediateBangla: "",
    };
  }

  let sourceForModel = cleanedSymptoms;
  let intermediateBangla = "";

  if (inputLanguage === "banglish") {
    const banglaRaw = await banglishToBangla(cleanedSymptoms);
    const banglaFixed = fixBangla(banglaRaw);
    sourceForModel = banglaFixed;
    intermediateBangla = banglaFixed;
  } else if (inputLanguage === "bn") {
    const banglaFixed = fixBangla(cleanedSymptoms);
    sourceForModel = banglaFixed;
    intermediateBangla = banglaFixed;
  }

  const raw = await callGroq({
    model: TRANSLATE_MODEL,
    temperature: 0,
    max_tokens: 120,
    response_format: { type: "json_object" },
    label: "Groq query normalizer",
    messages: [
      {
        role: "system",
        content: `
You are a medical query normalizer.

Your job:
1. Decide whether the user's message is a health-related symptom or medical concern.
2. If it is medical, convert it into a short English retrieval query but absolutely don't change it's context.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation outside JSON
- normalizedQueryEn must be short and search-friendly
- Use simple common medical phrasing
- If not medical, normalizedQueryEn must be an empty string

Return exactly:
{
  "isMedical": true,
  "normalizedQueryEn": "short english query"
}
        `.trim(),
      },
      {
        role: "user",
        content: `
Input language: ${inputLanguage}
User symptom text:
${sourceForModel}
        `.trim(),
      },
    ],
  });

  const parsed = safeJsonParse(raw);

  return {
    isMedical: Boolean(parsed?.isMedical),
    normalizedQueryEn: parsed?.isMedical
      ? String(parsed?.normalizedQueryEn || "").trim()
      : "",
    normalizedSourceText: sourceForModel,
    intermediateBangla,
  };
}