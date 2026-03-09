import fs from "fs/promises";
import path from "path";

const INPUT_JSON_PATH = path.join(
  process.cwd(),
  "Rag",
  "medlineplus-topics.json"
);

const OUTPUT_JSON_PATH = path.join(
  process.cwd(),
  "Rag",
  "carefind-seeds.json"
);

const ALLOWED_SPECIALISTS = [
  "General Physician",
  "Dermatologist",
  "Cardiologist",
  "Pulmonologist",
  "Gastroenterologist",
  "Neurologist",
  "Orthopedic",
  "Ophthalmologist",
  "ENT Specialist",
  "Psychiatrist",
  "Gynecologist",
  "Urologist",
  "Endocrinologist",
  "Pediatrician",
];

function normalizeText(text = "") {
  return String(text).toLowerCase().replace(/\s+/g, " ").trim();
}

function includesAny(text, keywords = []) {
  const lower = normalizeText(text);
  return keywords.some((k) => lower.includes(normalizeText(k)));
}

function uniqueClean(arr = []) {
  return [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))];
}

function shouldKeepTopic(topic) {
  if (!topic) return false;
  if (topic.language !== "English") return false;

  const title = normalizeText(topic.title || "");
  const groups = normalizeText((topic.groups || []).join(" "));
  const meta = normalizeText(topic.metaDesc || "");
  const summary = normalizeText(topic.summary || "");
  const text = [title, groups, meta, summary].join(" ");

  const excludedKeywords = [
    "diagnostic test",
    "lab test",
    "screening",
    "procedure",
    "surgery",
    "medical encyclopedia",
    "abortion"
  ];

  if (includesAny(text, excludedKeywords)) return false;

  const preferredGroups = [
    "symptoms",
    "mental health and behavior",
    "digestive system",
    "respiratory system",
    "heart and blood vessels",
    "skin conditions",
    "eye diseases",
    "female reproductive system",
    "male reproductive system",
    "brain and nerves",
    "bones joints and muscles",
    "endocrine system",
    "infections",
    "children and teenagers"
  ];

  const symptomKeywords = [
    "pain",
    "itching",
    "itchy",
    "rash",
    "redness",
    "fever",
    "cough",
    "shortness of breath",
    "difficulty breathing",
    "blurred vision",
    "ear pain",
    "sore throat",
    "abdominal pain",
    "stomach ache",
    "vomiting",
    "diarrhea",
    "constipation",
    "urination",
    "burning urination",
    "headache",
    "migraine",
    "anxiety",
    "depression",
    "panic",
    "joint pain",
    "back pain",
    "pelvic pain"
  ];

  return (
    (topic.groups || []).some((g) =>
      preferredGroups.includes(normalizeText(g))
    ) || includesAny(text, symptomKeywords)
  );
}

function inferBodySystem(topic) {
  const title = normalizeText(topic.title || "");
  const groups = normalizeText((topic.groups || []).join(" "));
  const meta = normalizeText(topic.metaDesc || "");
  const summary = normalizeText(topic.summary || "");
  const refs = normalizeText((topic.seeReferences || []).join(" "));
  const synonyms = normalizeText((topic.synonyms || []).join(" "));

  const primaryText = [title, groups, refs, synonyms].join(" ");
  const secondaryText = [meta, summary].join(" ");

  // Highest-confidence direct topic mappings first
  if (includesAny(primaryText, ["chest pain", "pain, chest", "heart", "blood, heart and circulation"])) {
    return "cardiovascular";
  }

  if (includesAny(primaryText, ["abdominal pain", "stomach ache", "bellyache", "digestive system"])) {
    return "digestive";
  }

  if (includesAny(primaryText, ["anxiety", "generalized anxiety disorder", "depression", "mental health and behavior"])) {
    return "mental health";
  }

  if (includesAny(primaryText, ["headache", "migraine", "brain and nerves", "seizure", "stroke"])) {
    return "neurological";
  }

  if (includesAny(primaryText, ["rash", "itching", "skin", "eczema", "acne", "skin conditions"])) {
    return "skin";
  }

  if (includesAny(primaryText, ["eye", "vision", "blurred vision", "eye diseases"])) {
    return "eye";
  }

  if (includesAny(primaryText, ["ear", "nose", "throat", "sinus", "tonsil", "hearing"])) {
    return "ear/nose/throat";
  }

  if (includesAny(primaryText, ["cough", "shortness of breath", "difficulty breathing", "lung", "respiratory system", "asthma"])) {
    return "respiratory";
  }

  if (includesAny(primaryText, ["urinary", "urination", "bladder", "kidney"])) {
    return "urinary";
  }

  if (includesAny(primaryText, ["pregnancy", "uterus", "ovary", "vaginal", "menstrual", "female reproductive"])) {
    return "female reproductive";
  }

  if (includesAny(primaryText, ["bone", "joint", "muscle", "fracture", "arthritis", "back pain", "bones joints and muscles"])) {
    return "musculoskeletal";
  }

  if (includesAny(primaryText, ["diabetes", "thyroid", "hormone", "endocrine"])) {
    return "endocrine";
  }

  if (includesAny(primaryText, ["children", "child", "teen", "adolescent", "pediatric"])) {
    return "pediatric";
  }

  // Only after primary signals fail, use broader summary/meta matching
  if (includesAny(secondaryText, ["chest pain", "heart attack", "angina", "palpitations"])) {
    return "cardiovascular";
  }

  if (includesAny(secondaryText, ["shortness of breath", "difficulty breathing", "lung", "pneumonia", "asthma"])) {
    return "respiratory";
  }

  if (includesAny(secondaryText, ["abdominal pain", "stomach", "vomiting", "diarrhea", "digestive"])) {
    return "digestive";
  }

  if (includesAny(secondaryText, ["anxiety", "panic attack", "depression", "mental health"])) {
    return "mental health";
  }

  return "general";
}
function mapSpecialist(bodySystem) {
  switch (bodySystem) {
    case "skin":
      return "Dermatologist";
    case "eye":
      return "Ophthalmologist";
    case "ear/nose/throat":
      return "ENT Specialist";
    case "cardiovascular":
      return "Cardiologist";
    case "respiratory":
      return "Pulmonologist";
    case "digestive":
      return "Gastroenterologist";
    case "urinary":
      return "Urologist";
    case "female reproductive":
      return "Gynecologist";
    case "musculoskeletal":
      return "Orthopedic";
    case "neurological":
      return "Neurologist";
    case "mental health":
      return "Psychiatrist";
    case "endocrine":
      return "Endocrinologist";
    case "pediatric":
      return "Pediatrician";
    default:
      return "General Physician";
  }
}

function inferEmergency(topic) {
  const text = normalizeText([
    topic.title,
    topic.metaDesc,
    topic.summary,
    ...(topic.groups || []),
    ...(topic.synonyms || []),
    ...(topic.seeReferences || []),
  ].join(" "));

  const emergencyKeywords = [
    "get medical help immediately",
    "seek emergency",
    "call 911",
    "sudden and sharp",
    "shortness of breath",
    "severe chest pain",
    "vomiting blood",
    "blood in your stool",
    "loss of consciousness",
    "seizure",
    "stroke",
    "can't breathe",
    "difficulty breathing",
    "heavy bleeding",
  ];

  return includesAny(text, emergencyKeywords);
}

function buildSearchText(seed) {
  return [
    `Title: ${seed.title}`,
    `Symptom cluster: ${seed.symptomCluster.join(", ")}`,
    `Synonyms: ${seed.synonyms.join(", ")}`,
    `Groups: ${seed.groups.join(", ")}`,
    `Body system: ${seed.bodySystem}`,
    `Recommended specialist: ${seed.recommendedSpecialist}`,
    `Emergency: ${seed.emergency}`,
    `Summary: ${seed.summary}`,
    `Explanation: ${seed.explanationSnippet}`,
    `Source: ${seed.source}`,
  ].join("\n");
}

function buildSeed(topic) {
  const bodySystem = inferBodySystem(topic);
  const recommendedSpecialist = mapSpecialist(bodySystem);

  let alternativeSpecialists = [];

  if (bodySystem === "cardiovascular") {
    alternativeSpecialists = ["Pulmonologist", "Gastroenterologist"];
  }

  const emergency = inferEmergency(topic);

  const symptomCluster = uniqueClean([
    topic.title,
    ...(topic.seeReferences || []),
  ]);

  const synonyms = uniqueClean([
    ...(topic.synonyms || []),
    ...(topic.seeReferences || []),
  ]);

  const explanationSnippet =
    topic.metaDesc?.trim() ||
    topic.summary?.slice(0, 240)?.trim() ||
    "";

  const shortSummary = (topic.summary || "").slice(0, 350).trim();

  const seed = {
    id: `cf_${topic.id}`,
    medlineplusId: topic.id,
    title: topic.title,
    symptomCluster,
    synonyms,
    groups: uniqueClean(topic.groups || []),
    bodySystem,
    recommendedSpecialist,
    alternativeSpecialists,
    emergency,
    explanationSnippet,
    summary: shortSummary,
    source: topic.source || "MedlinePlus",
  };

  return {
    ...seed,
    searchText: buildSearchText(seed),
  };
}

async function main() {
  const raw = await fs.readFile(INPUT_JSON_PATH, "utf8");
  const topics = JSON.parse(raw);

  const filtered = topics.filter(shouldKeepTopic);
  const seeds = filtered.map(buildSeed);

  const specialistFiltered = seeds.filter((s) =>
    ALLOWED_SPECIALISTS.includes(s.recommendedSpecialist)
  );

  await fs.writeFile(
    OUTPUT_JSON_PATH,
    JSON.stringify(specialistFiltered, null, 2),
    "utf8"
  );

  console.log(`Loaded topics: ${topics.length}`);
  console.log(`Filtered useful topics: ${filtered.length}`);
  console.log(`Final CareFind seeds: ${specialistFiltered.length}`);
  console.log(`Saved to: ${OUTPUT_JSON_PATH}`);

  console.log("\nSample seed:");
  console.log(JSON.stringify(specialistFiltered[0], null, 2));
}

main().catch((err) => {
  console.error("Failed to build CareFind seeds:", err);
  process.exit(1);
});