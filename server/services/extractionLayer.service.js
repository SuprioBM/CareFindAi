import { callGroq, safeJsonParse } from "../modules/ai/ai.groq.js";

const EXTRACTOR_MODEL = process.env.GROQ_MAIN_MODEL || "llama-3.3-70b-versatile";

export class ExtractionLayer {
  /**
   * Extract clinical state updates from user message
   * @param {string} message - The user's input text
   * @param {Object} currentState - The active clinicalState of the session
   * @returns {Promise<Object>} The extracted structured parameters
   */
  async extract(message, currentState = {}) {
    const prompt = `
You are a medical information extraction engine. Analyze the following patient message and the current clinical state, and extract the required structured data.

### Patient Message:
"${message}"

### Current Clinical State:
${JSON.stringify(currentState, null, 2)}

### Guidelines:
1. Identify any symptoms reported. Map them to the following canonical keys ONLY:
   - "fever"
   - "cough"
   - "headache"
   - "chest_pain"
   - "shortness_of_breath"
   - "abdominal_pain"
   - "nausea"
   - "vomiting"
   - "diarrhea"
   - "sore_throat"
   - "rash"
   - "back_pain"
   - "joint_pain"
   If a symptom does not map to any of these, you may use a descriptive lowercase snake_case key, but prefer the canonical ones.
2. For each symptom identified:
   - Extract its duration if mentioned (e.g., "2 days", "1 week") and save in 'symptomTimeline'.
   - Extract its severity if mentioned (e.g., "mild", "moderate", "severe", "8 out of 10") and save in 'severity'.
3. Extract demographics if mentioned:
   - 'age' (as a number or null)
   - 'gender' (e.g. "male", "female", "other", or null)
4. Extract list of 'riskFactors' (e.g., "hypertension", "diabetes", "smoking").
5. Extract list of 'medications' mentioned.
6. Extract list of 'medicalHistory' (past diagnoses, surgeries).
7. Extract list of 'redFlags' mentioned (e.g. "blood in stool", "stiff neck", "difficulty breathing", "fainting").

### Negation and Denial Rules (CRITICAL):
- Only extract symptoms, red flags, or risk factors that the patient explicitly confirms they ARE experiencing.
- If the patient denies a symptom (e.g., "no", "I don't have chest pain", "no fever", "denies shortness of breath", "not confused"), you MUST NOT extract it.
- Do NOT extract symptoms from the "Current Clinical State" context unless they are explicitly confirmed or repeated as active in the new "Patient Message".

You must return a valid JSON object ONLY. Do not include markdown code block syntax (like \`\`\`json), explanations, or notes.

### Return Format:
{
  "demographics": {
    "age": number | null,
    "gender": "string" | null
  },
  "symptoms": ["canonical_symptom_key", ...],
  "symptomTimeline": {
    "canonical_symptom_key": "extracted duration",
    ...
  },
  "severity": {
    "canonical_symptom_key": "extracted severity description or scale number",
    ...
  },
  "riskFactors": ["factor1", ...],
  "medications": ["med1", ...],
  "medicalHistory": ["history1", ...],
  "redFlags": ["flag1", ...]
}
`;

    try {
      const resultText = await callGroq({
        model: EXTRACTOR_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a clinical extraction engine. Respond only with valid JSON. No markdown, no conversation, no preamble.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 600,
        response_format: { type: "json_object" },
        label: "Information Extraction Layer",
      });

      const extracted = safeJsonParse(resultText);

      // Clean/normalize result
      return {
        demographics: {
          age: typeof extracted.demographics?.age === "number" ? extracted.demographics.age : null,
          gender: typeof extracted.demographics?.gender === "string" ? extracted.demographics.gender.trim().toLowerCase() : null,
        },
        symptoms: Array.isArray(extracted.symptoms) ? extracted.symptoms.map(s => String(s).toLowerCase()) : [],
        symptomTimeline: extracted.symptomTimeline && typeof extracted.symptomTimeline === "object" ? extracted.symptomTimeline : {},
        severity: extracted.severity && typeof extracted.severity === "object" ? extracted.severity : {},
        riskFactors: Array.isArray(extracted.riskFactors) ? extracted.riskFactors.map(s => String(s).toLowerCase()) : [],
        medications: Array.isArray(extracted.medications) ? extracted.medications.map(s => String(s).toLowerCase()) : [],
        medicalHistory: Array.isArray(extracted.medicalHistory) ? extracted.medicalHistory.map(s => String(s).toLowerCase()) : [],
        redFlags: Array.isArray(extracted.redFlags) ? extracted.redFlags.map(s => String(s).toLowerCase()) : [],
      };
    } catch (error) {
      console.error("Extraction error, flagging as failed extraction:", error);
      // NOTE: this is NOT the same as "the model ran and found nothing" — it means
      // the Groq call itself failed (bad model id, auth, network, etc). Callers
      // MUST check `_extractionFailed` before trusting this as a real (empty) result.
      return {
        demographics: { age: null, gender: null },
        symptoms: [],
        symptomTimeline: {},
        severity: {},
        riskFactors: [],
        medications: [],
        medicalHistory: [],
        redFlags: [],
        _extractionFailed: true,
        _extractionError: error?.message || "Unknown extraction error",
      };
    }
  }

  /**
   * Merge extracted data into current clinical state
   * @param {Object} state - The current clinicalState
   * @param {Object} extracted - The new extracted data
   * @returns {Object} The updated clinicalState
   */
  merge(state, extracted) {
    const updated = { ...state };

    // Demographics
    updated.demographics = {
      age: extracted.demographics.age !== null ? extracted.demographics.age : (state.demographics?.age || null),
      gender: extracted.demographics.gender !== null ? extracted.demographics.gender : (state.demographics?.gender || null),
    };

    // Symptoms (union)
    const symptomsSet = new Set([...(state.symptoms || []), ...extracted.symptoms]);
    updated.symptoms = Array.from(symptomsSet);

    // Timeline (merge maps)
    const timeline = state.symptomTimeline instanceof Map 
      ? Object.fromEntries(state.symptomTimeline.entries()) 
      : { ...(state.symptomTimeline || {}) };
    for (const [k, v] of Object.entries(extracted.symptomTimeline)) {
      if (v) timeline[k.toLowerCase()] = String(v);
    }
    updated.symptomTimeline = timeline;

    // Severity (merge maps)
    const severity = state.severity instanceof Map 
      ? Object.fromEntries(state.severity.entries()) 
      : { ...(state.severity || {}) };
    for (const [k, v] of Object.entries(extracted.severity)) {
      if (v) severity[k.toLowerCase()] = String(v);
    }
    updated.severity = severity;

    // Risk Factors (union)
    const riskSet = new Set([...(state.riskFactors || []), ...extracted.riskFactors]);
    updated.riskFactors = Array.from(riskSet);

    // Medications (union)
    const medSet = new Set([...(state.medications || []), ...extracted.medications]);
    updated.medications = Array.from(medSet);

    // Medical History (union)
    const histSet = new Set([...(state.medicalHistory || []), ...extracted.medicalHistory]);
    updated.medicalHistory = Array.from(histSet);

    // Red Flags (union)
    const flagSet = new Set([...(state.redFlags || []), ...extracted.redFlags]);
    updated.redFlags = Array.from(flagSet);

    return updated;
  }
}
