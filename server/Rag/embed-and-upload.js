import fs from "fs/promises";
import path from "path";
import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

const INPUT_JSON_PATH = path.join(
  process.cwd(),
  "Rag",
  "carefind-seeds.json"
);

const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "carefind_medical_kb";
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const JINA_API_KEY = process.env.JINA_API_KEY;

const JINA_MODEL = "jina-embeddings-v3";
const TEST_LIMIT = Number(process.env.RAG_TEST_LIMIT || 0); // 0 = upload all
const BATCH_SIZE = Number(process.env.RAG_BATCH_SIZE || 10);

if (!QDRANT_URL) throw new Error("Missing QDRANT_URL in .env");
if (!QDRANT_API_KEY) throw new Error("Missing QDRANT_API_KEY in .env");
if (!JINA_API_KEY) throw new Error("Missing JINA_API_KEY in .env");

const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

let VECTOR_SIZE = null;

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

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function normalizeWhitespace(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function buildSearchText(seed) {
  if (seed?.searchText && String(seed.searchText).trim()) {
    return normalizeWhitespace(seed.searchText);
  }

  return normalizeWhitespace(
    [
      seed?.title,
      Array.isArray(seed?.symptomCluster) ? seed.symptomCluster.join(", ") : "",
      Array.isArray(seed?.synonyms) ? seed.synonyms.join(", ") : "",
      Array.isArray(seed?.groups) ? seed.groups.join(", ") : "",
      seed?.bodySystem,
      seed?.summary,
      seed?.explanationSnippet,
      seed?.recommendedSpecialist,
      Array.isArray(seed?.alternativeSpecialists)
        ? seed.alternativeSpecialists.join(", ")
        : "",
    ]
      .filter(Boolean)
      .join(" ")
  );
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

async function detectVectorSize() {
  const vector = await embedTextWithJina("test embedding size");
  VECTOR_SIZE = vector.length;
  console.log(`Detected vector size for ${JINA_MODEL}:`, VECTOR_SIZE);
}

async function recreateCollection() {
  const collections = await withRetry(
    () => qdrant.getCollections(),
    "getCollections"
  );

  const exists = collections.collections.some(
    (c) => c.name === COLLECTION_NAME
  );

  if (exists) {
    await withRetry(
      () => qdrant.deleteCollection(COLLECTION_NAME),
      "deleteCollection"
    );
    console.log(`Deleted existing collection: ${COLLECTION_NAME}`);
    await delay(1500);
  }

  await detectVectorSize();

  await withRetry(
    () =>
      qdrant.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: "Cosine",
        },
      }),
    "createCollection"
  );

  console.log(`Created collection: ${COLLECTION_NAME}`);
  await delay(1000);
}

async function main() {
  await recreateCollection();

  const raw = await fs.readFile(INPUT_JSON_PATH, "utf8");
  const seeds = JSON.parse(raw);

  if (!Array.isArray(seeds) || !seeds.length) {
    throw new Error("Seed file is empty or invalid.");
  }

  const finalSeeds = TEST_LIMIT > 0 ? seeds.slice(0, TEST_LIMIT) : seeds;
  const batches = chunkArray(finalSeeds, BATCH_SIZE);

  console.log(`Using embedding model: ${JINA_MODEL}`);
  console.log(`Total seeds to upload: ${finalSeeds.length}`);
  console.log(`Batch size: ${BATCH_SIZE}`);

  let uploaded = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const points = [];

    for (const seed of batch) {
      const searchText = buildSearchText(seed);

      if (!searchText) {
        console.warn(
          `Skipping seed with missing searchable text: medlineplusId=${seed?.medlineplusId}`
        );
        continue;
      }

      const vector = await embedTextWithJina(searchText);

      points.push({
        id: Number(seed.medlineplusId),
        vector,
        payload: {
          internalId: seed.id,
          medlineplusId: seed.medlineplusId,
          title: seed.title,
          symptomCluster: seed.symptomCluster,
          synonyms: seed.synonyms,
          groups: seed.groups,
          bodySystem: seed.bodySystem,
          recommendedSpecialist: seed.recommendedSpecialist,
          alternativeSpecialists: seed.alternativeSpecialists,
          emergency: seed.emergency,
          explanationSnippet: seed.explanationSnippet,
          summary: seed.summary,
          source: seed.source,
          searchText,
        },
      });
    }

    if (!points.length) {
      console.log(`Batch ${i + 1}/${batches.length} had no valid points.`);
      continue;
    }

    await withRetry(
      () =>
        qdrant.upsert(COLLECTION_NAME, {
          wait: true,
          points,
        }),
      `upsert batch ${i + 1}`
    );

    uploaded += points.length;
    console.log(
      `Uploaded batch ${i + 1}/${batches.length} (${uploaded}/${finalSeeds.length})`
    );

    await delay(300);
  }

  console.log(`Finished uploading ${uploaded} points.`);
}

main().catch((err) => {
  console.error("Failed to upload seeds to Qdrant:", err);
  process.exit(1);
});