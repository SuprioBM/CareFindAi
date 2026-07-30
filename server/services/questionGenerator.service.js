import { callGroq } from "../modules/ai/ai.groq.js";

const GENERATOR_MODEL = process.env.GROQ_TRANSLATE_MODEL || "llama-3.1-8b-instant";

export class QuestionGenerator {
  /**
   * Generates a patient-friendly natural language question for a missing parameter key
   * @param {string} nextQuestionKey - The parameter key to ask about (e.g., "chest_pain_severity")
   * @param {Object} clinicalState - The current clinical state
   * @returns {Promise<string>} Natural language question
   */
  async generateQuestion(nextQuestionKey, clinicalState = {}) {
    const symptoms = (clinicalState.symptoms || []).join(", ") || "unspecified symptoms";
    const age = clinicalState.demographics?.age || "unspecified";
    const gender = clinicalState.demographics?.gender || "unspecified";

    const prompt = `
You are an empathetic clinical triage virtual assistant.
The backend has determined that the next critical piece of information to gather is represented by the key: "${nextQuestionKey}".

Patient Context:
- Active Symptoms: ${symptoms}
- Age: ${age}
- Gender: ${gender}

Task:
Formulate a single, conversational, clear, and patient-friendly question to gather the clinical detail for "${nextQuestionKey}".

Examples of how to translate keys:
- "cough_cough_type": "Is your cough dry, or are you coughing up mucus?"
- "chest_pain_severity": "On a scale of 1 to 10, with 10 being the most severe, how would you rate your chest pain?"
- "chest_pain_radiation": "Does the pain spread or radiate anywhere else, like your left arm, jaw, neck, or back?"
- "shortness_of_breath": "Are you experiencing any shortness of breath or difficulty breathing?"
- "diarrhea_frequency": "How many times a day are you experiencing diarrhea?"
- "fever_temperature": "Have you measured your temperature? If so, what was the reading?"

Rules:
1. Ask ONLY one question.
2. Be compassionate and professional.
3. Do NOT include any diagnosis, advice, preambles, greetings, or postscripts. Return ONLY the question text itself.
`;

    try {
      const question = await callGroq({
        model: GENERATOR_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a clinical virtual assistant. Reply only with the final question text. No preamble, no explanation, no conversation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
        label: "Question Generator Layer",
      });

      return question.trim();
    } catch (error) {
      console.error("Failed to generate conversational question, using fallback:", error);
      
      // Clinical-friendly fallback
      const cleanKey = nextQuestionKey.replace(/_/g, " ");
      return `Could you please tell me more about your ${cleanKey}?`;
    }
  }
}
