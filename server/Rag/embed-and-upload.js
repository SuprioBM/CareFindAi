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

if (!QDRANT_URL) throw new Error("Missing QDRANT_URL in .env");
if (!QDRANT_API_KEY) throw new Error("Missing QDRANT_API_KEY in .env");
if (!JINA_API_KEY) throw new Error("Missing JINA_API_KEY in .env");

const qdrant = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

let VECTOR_SIZE = null;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function embedTextWithJina(text) {
  const res = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JINA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "jina-embeddings-v2-base-en",
      input: [text],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jina embedding failed: ${res.status} ${err}`);
  }

  const json = await res.json();

  if (!json.data?.[0]?.embedding || !Array.isArray(json.data[0].embedding)) {
    throw new Error("Invalid embedding response from Jina");
  }

  return json.data[0].embedding;
}

async function detectVectorSize() {
  const vector = await embedTextWithJina("test embedding size");
  VECTOR_SIZE = vector.length;
  console.log("Detected vector size:", VECTOR_SIZE);
}

async function recreateCollection() {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some(
    (c) => c.name === COLLECTION_NAME
  );

  if (exists) {
    await qdrant.deleteCollection(COLLECTION_NAME);
    console.log(`Deleted existing collection: ${COLLECTION_NAME}`);
  }

  await detectVectorSize();

  await qdrant.createCollection(COLLECTION_NAME, {
    vectors: {
      size: VECTOR_SIZE,
      distance: "Cosine",
    },
  });

  console.log(`Created collection: ${COLLECTION_NAME}`);
}

async function main() {
  await recreateCollection();

  const raw = await fs.readFile(INPUT_JSON_PATH, "utf8");
  const seeds = JSON.parse(raw);

  // safer first run
  const limitedSeeds = seeds.slice(0, 100);
  const batches = chunkArray(limitedSeeds, 10);

  let uploaded = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const points = [];

    for (const seed of batch) {
      const vector = await embedTextWithJina(seed.searchText);

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
          searchText: seed.searchText,
        },
      });
    }

    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    uploaded += points.length;
    console.log(`Uploaded batch ${i + 1}/${batches.length} (${uploaded}/${limitedSeeds.length})`);
  }

  console.log(`Finished uploading ${uploaded} points.`);
}

main().catch((err) => {
  console.error("Failed to upload seeds to Qdrant:", err);
  process.exit(1);
});