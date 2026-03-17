import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "carefind_medical_kb";
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const JINA_API_KEY = process.env.JINA_API_KEY;
const JINA_MODEL = "jina-embeddings-v3";

if (!QDRANT_URL) throw new Error("Missing QDRANT_URL in .env");
if (!QDRANT_API_KEY) throw new Error("Missing QDRANT_API_KEY in .env");
if (!JINA_API_KEY) throw new Error("Missing JINA_API_KEY in .env");

const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.cause?.code || error?.code || "").toUpperCase();
  const status = error?.status || error?.response?.status;

  return (
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    status === 408 ||
    status === 429 ||
    status >= 500 ||
    msg.includes("econnreset") ||
    msg.includes("fetch failed") ||
    msg.includes("timeout") ||
    msg.includes("temporarily") ||
    msg.includes("socket hang up") ||
    msg.includes("rate limit") ||
    msg.includes("too many requests")
  );
}

async function withRetry(fn, label, retries = 3) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const retryable = isRetryableError(error);
      const isLastAttempt = attempt === retries;

      console.warn(
        `${label} failed (attempt ${attempt + 1}/${retries + 1}):`,
        error?.message || error
      );

      if (!retryable || isLastAttempt) break;

      await delay(800 * (attempt + 1));
    }
  }

  throw lastError;
}

function normalizeWhitespace(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function detectLanguage(text = "") {
  const cleaned = normalizeWhitespace(text);

  if (/[\u0980-\u09FF]/u.test(cleaned)) return "bn";

  const lower = cleaned.toLowerCase();
  const banglishHints = [
    /\bami\b/,
    /\bamr\b/,
    /\bamar\b/,
    /\bgolai\b/,
    /\bgolay\b/,
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
    /\bkrse\b/,
    /\bhocche\b/,
    /\blagche\b/,
    /\bashche\b/,
  ];

  const score = banglishHints.reduce(
    (count, pattern) => count + (pattern.test(lower) ? 1 : 0),
    0
  );

  if (score >= 1) return "banglish";
  return "en";
}

function normalizeBanglish(text = "") {
  let t = normalizeWhitespace(text.toLowerCase());

  const replacements = [
    [/\bgolay\b/g, "golai"],
    [/\bgolae\b/g, "golai"],
    [/\bbyatha\b/g, "betha"],
    [/\bjhor\b/g, "jor"],
    [/\bkashi\b/g, "cough"],
    [/\bjor\b/g, "fever"],
    [/\bbetha\b/g, "pain"],
    [/\bgolai\b/g, "throat"],
    [/\bmatha\b/g, "head"],
    [/\bpet\b/g, "stomach"],
    [/\bbuk\b/g, "chest"],
    [/\bbomi\b/g, "vomiting"],
    [/\bshash\b/g, "breathing"],
  ];

  for (const [pattern, replacement] of replacements) {
    t = t.replace(pattern, replacement);
  }

  return t;
}

function prepareRetrievalText(text = "", language = "en") {
  const cleaned = normalizeWhitespace(text);

  if (language === "banglish") {
    return normalizeBanglish(cleaned);
  }

  return cleaned;
}

async function embedTextWithJina(text) {
  const cleanedText = normalizeWhitespace(text);

  return withRetry(
    async () => {
      const res = await fetch("https://api.jina.ai/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JINA_API_KEY}`,
        },
        body: JSON.stringify({
          model: JINA_MODEL,
          input: [cleanedText],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        const wrapped = new Error(`Jina embedding failed: ${res.status} ${err}`);
        wrapped.status = res.status;
        throw wrapped;
      }

      const json = await res.json();

      if (!json.data?.[0]?.embedding || !Array.isArray(json.data[0].embedding)) {
        throw new Error("Invalid embedding response from Jina");
      }

      return json.data[0].embedding;
    },
    "embedTextWithJina"
  );
}

async function queryMedicalContext(userText, limit = 5, language = "auto") {
  const finalLanguage =
    language === "auto" ? detectLanguage(userText) : language;

  const preparedText = prepareRetrievalText(userText, finalLanguage);
  const vector = await embedTextWithJina(preparedText);

  const result = await withRetry(
    () =>
      qdrant.query(COLLECTION_NAME, {
        query: vector,
        limit,
        with_payload: true,
      }),
    "qdrant.query"
  );

  return {
    detectedLanguage: finalLanguage,
    preparedText,
    matches: (result.points || [])
      .map((point) => ({
        score: point.score,
        payload: point.payload,
      }))
      .filter(
        (item) => typeof item.score === "number" && item.score >= 0.45
      ),
  };
}

function getContentPreview(payload = {}) {
  return (
    payload.summary ||
    payload.explanationSnippet ||
    payload.searchText ||
    payload.text ||
    payload.content ||
    payload.chunk ||
    payload.body ||
    ""
  );
}

async function main() {
  const testQueries = [
    {
      text: "Cancer",
      language: "en",
    },
    {
      text: "Cancer",
      language: "banglish",
    },
    {
      text: "Cancer",
      language: "bn",
    },
  ];

  for (const test of testQueries) {
    const { detectedLanguage, preparedText, matches } =
      await queryMedicalContext(test.text, 5, test.language);

    console.log("\n==================================================");
    console.log(`Original Query: ${test.text}`);
    console.log(`Language: ${detectedLanguage}`);
    console.log(`Prepared Query: ${preparedText}`);
    console.log("Top matches:\n");

    if (!matches.length) {
      console.log("No matches found above threshold.");
      continue;
    }

    for (const match of matches) {
      const payload = match.payload || {};
      const preview = getContentPreview(payload);

      console.log(
        JSON.stringify(
          {
            score: match.score,
            title: payload.title || "N/A",
            recommendedSpecialist: payload.recommendedSpecialist || "N/A",
            bodySystem: payload.bodySystem || "N/A",
            symptomCluster: payload.symptomCluster || [],
            contentPreview: String(preview).slice(0, 400),
          },
          null,
          2
        )
      );
      console.log("--------------------------------------------------");
    }
  }
}

main().catch((err) => {
  console.error("Failed to query Qdrant:", err);
  process.exit(1);
});