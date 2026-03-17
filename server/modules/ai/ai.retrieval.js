import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

function requireRetrievalConfig() {
  const collectionName =
    process.env.QDRANT_COLLECTION || "carefind_medical_kb";
  const qdrantUrl = process.env.QDRANT_URL;
  const qdrantApiKey = process.env.QDRANT_API_KEY;
  const jinaApiKey = process.env.JINA_API_KEY;

  if (!qdrantUrl) throw new Error("Missing QDRANT_URL in environment");
  if (!qdrantApiKey) throw new Error("Missing QDRANT_API_KEY in environment");
  if (!jinaApiKey) throw new Error("Missing JINA_API_KEY in environment");

  return {
    collectionName,
    qdrantUrl,
    qdrantApiKey,
    jinaApiKey,
  };
}

function createQdrantClient() {
  const { qdrantUrl, qdrantApiKey } = requireRetrievalConfig();

  return new QdrantClient({
    url: qdrantUrl,
    apiKey: qdrantApiKey,
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.cause?.code || error?.code || "").toUpperCase();
  const status =
    error?.status ||
    error?.response?.status ||
    error?.data?.status_code;

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
    msg.includes("too many requests") ||
    msg.includes("overloaded") ||
    msg.includes("try again")
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

function normalizeLower(text = "") {
  return normalizeWhitespace(text).toLowerCase();
}

/**
 * Light query expansion.
 * Only expand when the exact normalized query is a known broad or important term.
 * This improves recall without over-hallucinating.
 */
function expandQuery(text = "") {
  const q = normalizeLower(text);

  const exactExpansions = {
    "cancer": "cancer malignancy tumor oncology",
    "oncology": "oncology cancer malignancy tumor",
    "tumor": "tumor neoplasm mass cancer oncology",
    "tumour": "tumor tumour neoplasm mass cancer oncology",

    "leukemia": "leukemia blood cancer haematology",
    "lymphoma": "lymphoma blood cancer lymphatic cancer haematology",
    "myeloma": "myeloma blood cancer haematology",
    "blood cancer": "blood cancer leukemia lymphoma myeloma haematology",

    "kidney failure": "kidney failure renal failure chronic kidney disease nephrology",
    "renal failure": "renal failure kidney failure chronic kidney disease nephrology",
    "ckd": "chronic kidney disease ckd kidney failure nephrology",

    "allergy": "allergy allergic reaction allergic rhinitis sneezing ent",
    "anaphylaxis":
      "anaphylaxis severe allergic reaction emergency allergy breathing difficulty",

    "heartburn": "heartburn acid reflux gerd chest burning",
    "acid reflux": "acid reflux gerd heartburn chest burning",

    "shortness of breath":
      "shortness of breath breathing difficulty dyspnea respiratory",
    "breathing difficulty":
      "breathing difficulty shortness of breath dyspnea respiratory",
    "dyspnea": "dyspnea shortness of breath breathing difficulty respiratory",

    "stroke": "stroke brain attack neurological emergency",
    "seizure": "seizure convulsion neurological emergency",

    "aneurysm": "aneurysm vascular surgery blood vessel swelling",
    "aneurysms": "aneurysm aneurysms vascular surgery blood vessel swelling",

    "alcohol use disorder":
      "alcohol use disorder alcohol addiction dependence psychiatry",
  };

  if (exactExpansions[q]) return exactExpansions[q];

  return text;
}

function buildEmbeddingTask(queryText) {
  const q = normalizeLower(queryText);

  // Jina v3 supports task-based embedding.
  // Use retrieval.query for user queries.
  return "retrieval.query";
}

async function embedTextWithJina(text) {
  const { jinaApiKey } = requireRetrievalConfig();
  const cleanedText = normalizeWhitespace(text);
  const task = buildEmbeddingTask(cleanedText);

  return withRetry(
    async () => {
      const res = await fetch("https://api.jina.ai/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jinaApiKey}`,
        },
        body: JSON.stringify({
          model: "jina-embeddings-v3",
          task,
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

function getDynamicThreshold(queryText) {
  const q = normalizeLower(queryText);

  // Broad one-word queries need slightly stricter filtering.
  const broadQueries = new Set([
    "cancer",
    "tumor",
    "tumour",
    "allergy",
    "pain",
    "bleeding",
    "dizziness",
    "fever",
    "cough",
  ]);

  if (broadQueries.has(q)) return 0.52;
  if (q.split(" ").length >= 4) return 0.42;

  return 0.45;
}

function computeRerankBonus(item, queryText) {
  const q = normalizeLower(queryText);
  const payload = item.payload || {};

  const title = normalizeLower(payload.title || "");
  const bodySystem = normalizeLower(payload.bodySystem || "");
  const specialist = normalizeLower(payload.recommendedSpecialist || "");
  const searchText = normalizeLower(payload.searchText || "");
  const synonyms = normalizeLower((payload.synonyms || []).join(" "));
  const cluster = normalizeLower((payload.symptomCluster || []).join(" "));
  const groups = normalizeLower((payload.groups || []).join(" "));

  let bonus = 0;

  if (!q) return bonus;

  // Strong exact/phrase matches
  if (title === q) bonus += 0.16;
  if (cluster === q) bonus += 0.14;
  if (title.includes(q)) bonus += 0.10;
  if (cluster.includes(q)) bonus += 0.08;
  if (synonyms.includes(q)) bonus += 0.07;

  // Query token overlap with title/cluster/synonyms
  const tokens = [...new Set(q.split(" ").filter((t) => t.length >= 3))];
  const titleHits = tokens.filter((t) => title.includes(t)).length;
  const clusterHits = tokens.filter((t) => cluster.includes(t)).length;
  const synonymHits = tokens.filter((t) => synonyms.includes(t)).length;

  bonus += Math.min(titleHits * 0.025, 0.08);
  bonus += Math.min(clusterHits * 0.02, 0.06);
  bonus += Math.min(synonymHits * 0.015, 0.05);

  // Useful direct boosts
  if (q.includes("cancer") && specialist.includes("oncology")) bonus += 0.08;
  if (
    (q.includes("leukemia") || q.includes("lymphoma") || q.includes("myeloma")) &&
    specialist.includes("haematology")
  ) {
    bonus += 0.08;
  }
  if (
    (q.includes("kidney") || q.includes("renal") || q.includes("nephro")) &&
    specialist.includes("nephrology")
  ) {
    bonus += 0.07;
  }
  if (
    (q.includes("allergy") || q.includes("anaphylaxis")) &&
    (specialist.includes("ent") || specialist.includes("general medicine"))
  ) {
    bonus += 0.04;
  }
  if (
    (q.includes("stroke") || q.includes("seizure") || q.includes("migraine")) &&
    specialist.includes("neurology")
  ) {
    bonus += 0.06;
  }
  if (
    (q.includes("aneurysm") || q.includes("vascular")) &&
    specialist.includes("vascular surgery")
  ) {
    bonus += 0.08;
  }

  // Penalize generic/support/procedure-ish topics if they do not match the query strongly
  const noisyTitlePatterns = [
    "choosing a doctor",
    "health care service",
    "advance directives",
    "after surgery",
    "wildfires",
    "anatomy",
    "blood count tests",
    "biopsy",
    "caregivers",
  ];

  if (noisyTitlePatterns.some((p) => title.includes(p)) && !title.includes(q)) {
    bonus -= 0.12;
  }

  // Small penalty for very weak semantic relation when searchText doesn't contain query
  if (
    !title.includes(q) &&
    !cluster.includes(q) &&
    !synonyms.includes(q) &&
    !searchText.includes(q)
  ) {
    bonus -= 0.04;
  }

  // Body-system hints
  if (
    (q.includes("lung") || q.includes("breath") || q.includes("cough")) &&
    bodySystem.includes("respiratory")
  ) {
    bonus += 0.03;
  }

  if (
    (q.includes("skin") || q.includes("rash") || q.includes("itch")) &&
    bodySystem.includes("skin")
  ) {
    bonus += 0.03;
  }

  if (
    (q.includes("abdominal") || q.includes("stomach") || q.includes("diarrhea")) &&
    bodySystem.includes("digestive")
  ) {
    bonus += 0.03;
  }

  return bonus;
}

function rerankMatches(matches, queryText) {
  return matches
    .map((item) => {
      const rerankBonus = computeRerankBonus(item, queryText);
      const rerankScore = (item.score || 0) + rerankBonus;

      return {
        ...item,
        rerankBonus,
        rerankScore,
      };
    })
    .sort((a, b) => b.rerankScore - a.rerankScore);
}

function applyPostFilters(matches, queryText) {
  const q = normalizeLower(queryText);

  return matches.filter((item) => {
    const payload = item.payload || {};
    const title = normalizeLower(payload.title || "");
    const specialist = normalizeLower(payload.recommendedSpecialist || "");
    const searchText = normalizeLower(payload.searchText || "");

    // Keep exact title matches no matter what
    if (title === q || title.includes(q)) return true;

    // Broad-query routing guardrails
    if (q === "cancer") {
      return (
        specialist.includes("oncology") ||
        specialist.includes("haematology") ||
        title.includes("cancer") ||
        searchText.includes("malignancy") ||
        searchText.includes("oncology")
      );
    }

    if (q === "allergy") {
      return (
        specialist.includes("ent") ||
        specialist.includes("general medicine") ||
        title.includes("allergy") ||
        searchText.includes("allergic")
      );
    }

    if (q === "aneurysm" || q === "aneurysms") {
      return (
        specialist.includes("vascular surgery") ||
        specialist.includes("cardiac surgery") ||
        title.includes("aneurysm")
      );
    }

    return true;
  });
}

/**
 * Queries that are broad/high-impact enough to merit a routing hint.
 * This does NOT replace retrieval; it helps bias retrieval toward the right family.
 */
function getRoutingHint(queryText) {
  const q = normalizeLower(queryText);

  if (q === "cancer") {
    return {
      preferredSpecialists: ["Cancer / Oncology", "Haematology"],
      preferredTitles: ["cancer", "leukemia", "lymphoma", "myeloma"],
    };
  }

  if (q === "leukemia" || q === "lymphoma" || q === "myeloma") {
    return {
      preferredSpecialists: ["Haematology", "Cancer / Oncology"],
      preferredTitles: [q],
    };
  }

  if (q === "allergy" || q === "anaphylaxis") {
    return {
      preferredSpecialists: ["ENT", "General Medicine"],
      preferredTitles: ["allergy", "anaphylaxis"],
    };
  }

  if (q === "aneurysm" || q === "aneurysms") {
    return {
      preferredSpecialists: ["Vascular Surgery", "Cardiac Surgery"],
      preferredTitles: ["aneurysm"],
    };
  }

  return null;
}

function applyRoutingHint(matches, queryText) {
  const hint = getRoutingHint(queryText);
  if (!hint) return matches;

  const preferredSpecialists = hint.preferredSpecialists.map(normalizeLower);
  const preferredTitles = hint.preferredTitles.map(normalizeLower);

  return matches
    .map((item) => {
      const payload = item.payload || {};
      const title = normalizeLower(payload.title || "");
      const specialist = normalizeLower(payload.recommendedSpecialist || "");

      let bonus = 0;

      if (preferredSpecialists.some((s) => specialist.includes(s))) bonus += 0.06;
      if (preferredTitles.some((t) => title.includes(t))) bonus += 0.05;

      return {
        ...item,
        rerankScore: (item.rerankScore ?? item.score ?? 0) + bonus,
      };
    })
    .sort((a, b) => b.rerankScore - a.rerankScore);
}

export async function queryMedicalContext(
  userText,
  limit = 5,
  language = "en"
) {
  const { collectionName } = requireRetrievalConfig();
  const qdrant = createQdrantClient();

  const rawQueryText = normalizeWhitespace(userText);
  const expandedQueryText = expandQuery(rawQueryText);
  const vector = await embedTextWithJina(expandedQueryText);

  // Pull a larger candidate pool, then rerank locally.
  const initialLimit = Math.max(limit * 3, 12);

  const result = await withRetry(
    () =>
      qdrant.query(collectionName, {
        query: vector,
        limit: initialLimit,
        with_payload: true,
      }),
    "qdrant.query"
  );

  const threshold = getDynamicThreshold(rawQueryText);

  let matches = (result.points || [])
    .map((point) => ({
      score: point.score,
      payload: point.payload,
    }))
    .filter((item) => typeof item.score === "number" && item.score >= threshold);

  matches = rerankMatches(matches, rawQueryText);
  matches = applyRoutingHint(matches, rawQueryText);
  matches = applyPostFilters(matches, rawQueryText);

  return matches.slice(0, limit);
}

export function buildContextText(matches = []) {
  return matches
    .slice(0, 5)
    .map((match, index) => {
      const payload = match.payload || {};

      const body = [
        `Symptom cluster: ${(payload.symptomCluster || []).join(", ")}`,
        `Synonyms: ${(payload.synonyms || []).join(", ")}`,
        `Groups: ${(payload.groups || []).join(", ")}`,
        `Summary: ${payload.summary || ""}`,
        `Explanation: ${payload.explanationSnippet || ""}`,
      ]
        .filter(Boolean)
        .join("\n");

      return [
        `Document ${index + 1}`,
        `Title: ${payload.title || "N/A"}`,
        `Recommended Specialist: ${payload.recommendedSpecialist || "N/A"}`,
        `Body System: ${payload.bodySystem || "N/A"}`,
        `Score: ${
          typeof match.rerankScore === "number"
            ? match.rerankScore.toFixed(3)
            : typeof match.score === "number"
            ? match.score.toFixed(3)
            : "N/A"
        }`,
        `Content: ${String(body).slice(0, 900)}`,
      ].join("\n");
    })
    .join("\n\n");
}