import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

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

async function queryMedicalContext(userText, limit = 5) {
  const vector = await embedTextWithJina(userText);

  const result = await qdrant.query(COLLECTION_NAME, {
    query: vector,
    limit,
    with_payload: true,
  });

  return result.points.map((point) => ({
    score: point.score,
    payload: point.payload,
  }));
}

async function main() {
  const testQuery = "My stomach hurts badly and I feel pain in my belly";

  const matches = await queryMedicalContext(testQuery, 5);

  console.log(`Query: ${testQuery}\n`);
  console.log("Top matches:\n");

  for (const match of matches) {
    console.log(JSON.stringify(match, null, 2));
    console.log("--------------------------------------------------");
  }
}

main().catch((err) => {
  console.error("Failed to query Qdrant:", err);
  process.exit(1);
});