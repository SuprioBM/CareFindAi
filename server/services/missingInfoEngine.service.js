import { SYMPTOM_REGISTRY } from "../data/symptomRegistry.js";

export class MissingInfoEngine {
  /**
   * Identifies missing required clinical details based on detected symptoms
   * @param {Object} state - The clinicalState of the session
   * @returns {Array<Object>} List of missing question descriptors
   */
  findMissing(state) {
    if (!state) return [];

    const symptoms = (state.symptoms || []).map((s) => String(s).toLowerCase().trim());
    const answeredQuestions = (state.answeredQuestions || []).map((q) => String(q).toLowerCase().trim());
    
    const timeline = state.symptomTimeline instanceof Map 
      ? Object.fromEntries(state.symptomTimeline.entries()) 
      : (state.symptomTimeline || {});
      
    const severityMap = state.severity instanceof Map 
      ? Object.fromEntries(state.severity.entries()) 
      : (state.severity || {});

    const missing = [];

    for (const symptom of symptoms) {
      const reg = SYMPTOM_REGISTRY[symptom];
      if (!reg) continue;

      // 1. Check required questions
      for (const param of reg.requiredQuestions) {
        const questionKey = `${symptom}_${param}`.toLowerCase();

        // Check if duration is already present in timeline
        if (param === "duration" && timeline[symptom]) {
          continue;
        }
        // Check if severity is already present in severityMap
        if (param === "severity" && severityMap[symptom]) {
          continue;
        }
        // Check if answeredQuestions contains this key
        if (answeredQuestions.includes(questionKey)) {
          continue;
        }

        missing.push({
          key: questionKey,
          type: "required",
          symptom: symptom,
          paramName: param,
        });
      }

      // 2. Check red flags
      for (const redFlag of reg.redFlags) {
        const redFlagKey = redFlag.toLowerCase();

        // If the red flag symptom is already present in symptoms list, we don't need to ask
        if (symptoms.includes(redFlagKey)) {
          continue;
        }

        // If we have already asked and answered this red flag question
        if (answeredQuestions.includes(redFlagKey)) {
          continue;
        }

        missing.push({
          key: redFlagKey,
          type: "red_flag",
          symptom: symptom,
          paramName: redFlag,
        });
      }
    }

    return missing;
  }
}
