import { callGroq, safeJsonParse } from "../modules/ai/ai.groq.js";
import { LLMExtractionSchema } from "../validators/llm.schema.js";
import { DOMAIN_CONFIG } from "../config/domain.config.js";

const MODEL = "llama-3.3-70b-versatile";

const DEFAULT_CONFIDENCE = 0.6;

const PARAMETER_TYPE_MAP = (() => {
  const map = {};

  for (const domain of Object.values(DOMAIN_CONFIG)) {
    for (const [key, config] of Object.entries(domain.parameters || {})) {
      if (!map[key]) {
        map[key] = config.type;
      }
    }
  }

  map.age = "scale";
  map.gender = "enum";
  map.duration = "enum";
  map.severity = "enum";
  map.existing_conditions = "enum";

  return map;
})();

const SYMPTOM_ALIAS_MAP = {
  chest_pain: "chest pain",
  chestpain: "chest pain",
  heartache: "chest pain",
  "heart ache": "chest pain",
  trouble_breathing: "breathing difficulty",
  "trouble breathing": "breathing difficulty",
  breathlessness: "breathing difficulty",
  shortness_of_breath: "shortness of breath",
  "skin rashes": "skin rash",
  rashes: "skin rash",
  "weird skin rashes": "skin rash",
  "extremely tired": "fatigue",
  "very tired": "fatigue",
  "body aches": "body ache",
  jaw_pain: "jaw pain",
  stroke: "stroke symptoms",
  "having stroke": "stroke symptoms",
  "left arm numb": "weakness one side",
  "left arm numbness": "weakness one side",
  "arm numbness": "weakness one side",
  "numb left arm": "weakness one side",
  "one sided numbness": "weakness one side",
  "unilateral numbness": "weakness one side"
};

const PARAMETER_ALIAS_MAP = {
  arm_numbness: "arm_numbness",
  left_arm_numbness: "arm_numbness",
  left_arm_numb: "arm_numbness",
  one_sided_numbness: "weakness_one_side",
  unilateral_numbness: "weakness_one_side",
  speech_problems: "speech_issue",
  slurred_speech: "speech_issue",
  fever_duration: "fever_duration_days",
  fever_days: "fever_duration_days",
  contact_with_sick: "recent_sick_contact",
  sick_contact: "recent_sick_contact",
  swollen_joints: "joint_swelling",
  joint_swelling_present: "joint_swelling",
  stiffness_morning: "morning_stiffness"
};

export class LLMService {
  /**
   * MAIN ENTRY WITH FAILSAFE PIPELINE
   */
  async parse(message, currentState = {}) {
    // 🔁 TRY 1 — FULL PROMPT
    let result = await this.tryCall(message, currentState, false);

    if (result) return result;

    console.warn("LLM retrying with fallback prompt...");

    // 🔁 TRY 2 — SIMPLIFIED PROMPT
    result = await this.tryCall(message, currentState, true);

    if (result) return result;

    console.error("LLM failed twice → using SAFE FALLBACK");

    // 🧠 FINAL FALLBACK (NEVER FAIL PIPELINE)
    return this.fallbackResponse();
  }

  /**
   * SINGLE ATTEMPT CALL
   */
  async tryCall(message, currentState, isFallbackPrompt = false) {
    const prompt = this.buildPrompt(message, currentState, isFallbackPrompt);

    try {
      const response = await callGroq({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `
You are a clinical triage information extraction engine.

CRITICAL RULES:
- Extract ONLY medical signals
- Do NOT diagnose
- Do NOT give advice
- Output ONLY valid JSON
- No markdown, no explanation
- If unsure, reduce confidence instead of guessing
            `.trim()
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const raw = safeJsonParse(response);
      const normalized = this.normalizeExtractionOutput(raw);

      const parsed = LLMExtractionSchema.safeParse(normalized);

      if (!parsed.success) {
        console.warn("Schema validation failed:", parsed.error.message);
        return null;
      }

      return parsed.data;
    } catch (err) {
      console.error("LLM call failed:", err.message);
      return null;
    }
  }

  normalizeExtractionOutput(raw) {
    const source = raw && typeof raw === "object" ? raw : {};

    return {
      detectedSymptoms: this.normalizeDetectedSymptoms(source.detectedSymptoms),
      extractedData: this.normalizeExtractedData(source.extractedData)
    };
  }

  normalizeDetectedSymptoms(input) {
    if (!Array.isArray(input)) return [];

    const normalized = [];

    for (const item of input) {
      if (typeof item === "string") {
        const name = this.canonicalizeSymptomName(item);
        if (name) {
          normalized.push({ name, confidence: 0.7 });
        }
        continue;
      }

      if (item && typeof item === "object") {
        const rawName =
          typeof item.name === "string"
            ? item.name
            : typeof item.symptom === "string"
              ? item.symptom
              : "";

        const name = this.canonicalizeSymptomName(rawName);
        if (!name) continue;

        normalized.push({
          name,
          confidence: this.normalizeConfidence(item.confidence)
        });
      }
    }

    return normalized;
  }

  canonicalizeSymptomName(value) {
    const normalized = String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!normalized) return "";

    return SYMPTOM_ALIAS_MAP[normalized] || normalized;
  }

  normalizeExtractedData(input) {
    if (!input || typeof input !== "object") return {};

    const normalized = {};

    for (const [rawKey, value] of Object.entries(input)) {
      const normalizedKey = String(rawKey || "").trim().toLowerCase();
      const key = PARAMETER_ALIAS_MAP[normalizedKey] || normalizedKey;

      const wrapped = this.wrapWithConfidence(value);
      const expectedType = PARAMETER_TYPE_MAP[key];

      normalized[key] = {
        value: this.coerceValueByType(wrapped.value, expectedType, key),
        confidence: this.normalizeConfidence(wrapped.confidence)
      };
    }

    return normalized;
  }

  wrapWithConfidence(value) {
    if (value && typeof value === "object" && "value" in value) {
      return {
        value: value.value,
        confidence: value.confidence
      };
    }

    return {
      value,
      confidence: DEFAULT_CONFIDENCE
    };
  }

  normalizeConfidence(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return DEFAULT_CONFIDENCE;
    return Math.max(0, Math.min(1, num));
  }

  coerceValueByType(value, expectedType, key) {
    if (expectedType === "scale") {
      return this.coerceToNumber(value);
    }

    if (expectedType === "boolean") {
      return this.coerceToBoolean(value, false);
    }

    if (expectedType === "enum") {
      return this.coerceToString(value);
    }

    if (/(severity|level)$/i.test(key)) {
      return this.coerceToNumber(value);
    }

    if (typeof value === "string") {
      const maybeBoolean = this.coerceToBoolean(value, null);
      if (typeof maybeBoolean === "boolean") return maybeBoolean;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return value;
    }

    return this.coerceToString(value);
  }

  coerceToNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "boolean") {
      return value ? 1 : 0;
    }

    const text = String(value || "").trim().toLowerCase();
    if (!text) return 0;

    const severityMap = {
      none: 0,
      low: 3,
      mild: 3,
      moderate: 5,
      medium: 5,
      high: 8,
      severe: 8,
      extreme: 10
    };

    if (text in severityMap) {
      return severityMap[text];
    }

    const numeric = Number(text);
    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const embedded = text.match(/\d+(\.\d+)?/);
    if (embedded) {
      const parsed = Number(embedded[0]);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return 0;
  }

  coerceToBoolean(value, fallback = null) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;

    const text = String(value || "").trim().toLowerCase();
    if (!text) return fallback;

    if (["yes", "y", "true", "1", "present", "positive"].includes(text)) {
      return true;
    }

    if (["no", "n", "false", "0", "absent", "negative"].includes(text)) {
      return false;
    }

    return fallback;
  }

  coerceToString(value) {
    if (typeof value === "string") return value.trim().toLowerCase();
    if (value === null || value === undefined) return "";
    return String(value).trim().toLowerCase();
  }

  /**
   * PROMPT BUILDER (NORMAL + FALLBACK MODE)
   */
  buildPrompt(message, state, isFallback) {
    if (isFallback) {
      // 🔥 simplified prompt for retry
      return `
Extract basic medical info only.

Message:
"${message}"

Return ONLY JSON:

{
  "detectedSymptoms": [],
  "extractedData": {}
}
      `.trim();
    }

    // 🧠 FULL PROMPT (CONFIDENCE-AWARE)
    return `
PATIENT MESSAGE:
"${message}"

CURRENT STATE:
${JSON.stringify(state, null, 2)}

TASK:
Extract medical signals with confidence scoring.

RULES:
- symptom confidence: 0.0 - 1.0
- do NOT assume missing info
- implied symptoms = 0.5–0.7
- clear symptoms = 0.8–1.0

OUTPUT FORMAT (STRICT JSON):

{
  "detectedSymptoms": [
    {
      "name": "string",
      "confidence": 0.0
    }
  ],

  "extractedData": {
    "parameter_key": {
      "value": "number | boolean | string",
      "confidence": 0.0
    }
  }
}

EXTRACTION NOTES:
- Include any relevant triage parameter keys you can infer from the message.
- Use snake_case keys (example: pain_severity, blood_in_stool, urine_output, speech_issue).
- Omit unknown parameters; do not fabricate values.
    `.trim();
  }

  /**
   * SAFE FALLBACK (NEVER BREAK PIPELINE)
   */
  fallbackResponse() {
    return {
      detectedSymptoms: [],
      extractedData: {},
      _meta: {
        fallback: true,
        reason: "LLM failure or invalid schema",
        confidenceMode: "degraded"
      }
    };
  }
}