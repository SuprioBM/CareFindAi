import fs from "fs/promises";
import path from "path";
import { XMLParser } from "fast-xml-parser";

const INPUT_XML_PATH = path.join(process.cwd(), "data", "mplus_topics.xml");
const OUTPUT_JSON_PATH = path.join(
  process.cwd(),
  "Rag",
  "medlineplus-topics.json"
);

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTextValue(item) {
  if (!item) return "";
  if (typeof item === "string") return item.trim();
  if (typeof item === "number") return String(item);
  if (typeof item === "object" && "#text" in item) {
    return String(item["#text"]).trim();
  }
  return "";
}

function extractAlsoCalled(topic) {
  return ensureArray(topic["also-called"])
    .map(extractTextValue)
    .filter(Boolean);
}

function extractGroups(topic) {
  return ensureArray(topic.group)
    .map((g) => {
      if (typeof g === "string") return g.trim();
      if (g && typeof g === "object") {
        if (typeof g["#text"] === "string") return g["#text"].trim();
      }
      return "";
    })
    .filter(Boolean);
}

function extractSeeReferences(topic) {
  return ensureArray(topic["see-reference"])
    .map(extractTextValue)
    .filter(Boolean);
}

function extractMeshDescriptors(topic) {
  const meshHeadings = ensureArray(topic["mesh-heading"]);
  const descriptors = [];

  for (const heading of meshHeadings) {
    const descs = ensureArray(heading?.descriptor);
    for (const d of descs) {
      const text = extractTextValue(d);
      if (text) descriptors.push(text);
    }
  }

  return descriptors;
}

function buildTopicRecord(topic) {
  const id = topic?.["@_id"] || "";
  const title = topic?.["@_title"]?.trim() || "";
  const url = topic?.["@_url"] || "";
  const language = topic?.["@_language"] || "";
  const dateCreated = topic?.["@_date-created"] || "";
  const metaDesc = topic?.["@_meta-desc"] || "";

  const synonyms = extractAlsoCalled(topic);
  const groups = extractGroups(topic);
  const seeReferences = extractSeeReferences(topic);
  const meshDescriptors = extractMeshDescriptors(topic);

  const fullSummaryRaw = topic["full-summary"] || "";
  const summary = stripHtml(
    typeof fullSummaryRaw === "string"
      ? fullSummaryRaw
      : fullSummaryRaw?.["#text"] || JSON.stringify(fullSummaryRaw)
  );

  return {
    id,
    title,
    url,
    language,
    dateCreated,
    metaDesc: stripHtml(metaDesc),
    synonyms,
    groups,
    seeReferences,
    meshDescriptors,
    summary,
    source: "MedlinePlus",
  };
}

async function main() {
  const xmlData = await fs.readFile(INPUT_XML_PATH, "utf8");

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
    parseTagValue: false,
    processEntities: true,
  });

  const parsed = parser.parse(xmlData);

  const root = parsed["health-topics"];
  if (!root) {
    throw new Error("Could not find <health-topics> root in XML.");
  }

  const topics = ensureArray(root["health-topic"]);
  console.log(`Found ${topics.length} health topics in XML.`);

  const cleanedTopics = topics
    .map(buildTopicRecord)
    .filter((t) => t.id && t.title);

  await fs.writeFile(
    OUTPUT_JSON_PATH,
    JSON.stringify(cleanedTopics, null, 2),
    "utf8"
  );

  console.log(`Saved cleaned topics to: ${OUTPUT_JSON_PATH}`);
  console.log(`Total cleaned topics: ${cleanedTopics.length}`);

  console.log("\nSample topic:");
  console.log(JSON.stringify(cleanedTopics[0], null, 2));
}

main().catch((err) => {
  console.error("Failed to parse MedlinePlus XML:", err);
  process.exit(1);
});