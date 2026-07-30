export class EmergencyLayer {
  /**
   * Evaluates the clinical state for emergency conditions
   * @param {Object} state - The clinicalState to evaluate
   * @returns {Object} { emergencyDetected: boolean, emergencyReason: string | null }
   */
  check(state) {
    if (!state) {
      return { emergencyDetected: false, emergencyReason: null };
    }

    const symptoms = (state.symptoms || []).map((s) => String(s).toLowerCase().trim());
    const redFlags = (state.redFlags || []).map((r) => String(r).toLowerCase().trim());
    const severityMap = state.severity instanceof Map 
      ? Object.fromEntries(state.severity.entries()) 
      : (state.severity || {});

    // Rule 1: Chest pain + shortness of breath
    if (symptoms.includes("chest_pain") && symptoms.includes("shortness_of_breath")) {
      return {
        emergencyDetected: true,
        emergencyReason: "Potential cardiac event: Combination of chest pain and shortness of breath.",
      };
    }

    // Rule 2: Stroke indicators
    const strokeIndicators = [
      "stroke",
      "slurred_speech",
      "weakness_one_side",
      "facial_droop",
      "confusion",
      "one_sided_numbness",
      "sudden_paralysis"
    ];
    const hasStrokeSymptom =
      symptoms.some((s) => strokeIndicators.includes(s)) ||
      redFlags.some((r) => strokeIndicators.some((indicator) => r.includes(indicator)));
    if (hasStrokeSymptom) {
      return {
        emergencyDetected: true,
        emergencyReason: "Potential stroke event: Sudden slurred speech, weakness on one side, or confusion.",
      };
    }

    // Rule 3: Loss of consciousness or collapse
    const collapseIndicators = [
      "fainting",
      "syncope",
      "loss_of_consciousness",
      "collapse",
      "passed_out"
    ];
    const hasCollapse =
      symptoms.some((s) => collapseIndicators.includes(s)) ||
      redFlags.some((r) => collapseIndicators.some((indicator) => r.includes(indicator)));
    if (hasCollapse) {
      return {
        emergencyDetected: true,
        emergencyReason: "Potential circulatory or neurological collapse: Loss of consciousness or fainting.",
      };
    }

    // Rule 4: Severe respiratory distress
    const respiratoryDistress = [
      "cyanosis",
      "bluish_lips",
      "unable_to_breathe",
      "difficulty_breathing",
      "unable_to_speak_in_full_sentences"
    ];
    const hasRespDistress =
      symptoms.includes("cyanosis") ||
      redFlags.some((r) => respiratoryDistress.some((indicator) => r.includes(indicator)));
    if (hasRespDistress) {
      return {
        emergencyDetected: true,
        emergencyReason: "Severe respiratory distress: Inability to breathe properly or signs of low oxygen (blue lips/cyanosis).",
      };
    }

    // Rule 5: Severe allergic reaction (Anaphylaxis)
    const anaphylaxisIndicators = [
      "anaphylaxis",
      "throat_closing",
      "swelling_of_lips_tongue",
      "severe_allergic_reaction"
    ];
    const hasAnaphylaxis =
      symptoms.some((s) => anaphylaxisIndicators.includes(s)) ||
      redFlags.some((r) => anaphylaxisIndicators.some((indicator) => r.includes(indicator)));
    if (hasAnaphylaxis) {
      return {
        emergencyDetected: true,
        emergencyReason: "Potential anaphylactic reaction: Airway swelling or severe systemic allergic reaction.",
      };
    }

    // Rule 6: Active internal bleeding signs
    const bleedingIndicators = [
      "vomiting_blood",
      "coughing_blood",
      "blood_in_stool",
      "hematemesis",
      "hemoptysis",
      "melena"
    ];
    const hasInternalBleeding =
      redFlags.some((r) => bleedingIndicators.some((indicator) => r.includes(indicator))) ||
      symptoms.some((s) => bleedingIndicators.includes(s));
    if (hasInternalBleeding) {
      return {
        emergencyDetected: true,
        emergencyReason: "Potential hemorrhage alert: Signs of internal bleeding (blood in vomit, stool, or cough).",
      };
    }

    // Rule 7: Critical pain levels for major symptoms
    if (severityMap.chest_pain === "severe" || severityMap.chest_pain === "extreme" || Number(severityMap.chest_pain) >= 9) {
      return {
        emergencyDetected: true,
        emergencyReason: "Potential acute coronary syndrome: Extremely severe chest pain.",
      };
    }

    return {
      emergencyDetected: false,
      emergencyReason: null,
    };
  }
}
