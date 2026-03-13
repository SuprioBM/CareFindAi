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

async function embedTextWithJina(text) {
  const { jinaApiKey } = requireRetrievalConfig();

  const res = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jinaApiKey}`,
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

export async function queryMedicalContext(userText, limit = 5) {
  const { collectionName } = requireRetrievalConfig();
  const qdrant = createQdrantClient();
  const vector = await embedTextWithJina(userText);

  const result = await qdrant.query(collectionName, {
    query: vector,
    limit,
    with_payload: true,
  });

  return result.points.map((point) => ({
    score: point.score,
    payload: point.payload,
  }));
}

export function buildContextText(matches = []) {
  return matches
    .map((match, index) => {
      const payload = match.payload || {};
      const body =
        payload.text || payload.content || payload.chunk || payload.body || "";

      return [
        `Document ${index + 1}`,
        `Title: ${payload.title || "N/A"}`,
        `Content: ${String(body).slice(0, 1200)}`,
      ].join("\n");
    })
    .join("\n\n");
}