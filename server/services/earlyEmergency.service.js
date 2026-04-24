import { RuleEngine } from "../engine/ruleEngine.js";

export class EarlyEmergencyService {
  constructor() {
    this.symptomLexicon = {
      "chest pain": ["chest pain", "chest pressure", "tight chest"],
      "jaw pain": ["jaw pain"],
      "slurred speech": ["slurred speech", "speech problem", "speech issue"],
      weakness_one_side: ["weakness one side", "one sided weakness", "weakness on one side"],
      unconscious: ["unconscious", "loss of consciousness"],
      "not breathing": ["not breathing", "cant breathe", "cannot breathe"],
      "severe bleeding": ["severe bleeding", "bleeding heavily"]
    };
  }

  /**
   * MAIN ENTRY
   */
  check(message = "") {
    const text = this.normalize(message);

    const detectedSymptoms = this.extractSymptoms(text);
    const rawParameters = this.extractRawParameters(text);

    const ruleEngine = new RuleEngine({
      detectedSymptoms,
      rawParameters,
      currentDomain: "general"
    });

    const ruleResult = ruleEngine.evaluate();

    if (ruleResult.override) {
      return this.buildResponse(ruleResult);
    }

    return null;
  }

  extractSymptoms(text) {
    const detected = [];

    for (const [normalized, aliases] of Object.entries(this.symptomLexicon)) {
      if (this.contains(text, aliases)) {
        detected.push({ name: normalized, confidence: 1 });
      }
    }

    if (this.contains(text, ["shortness of breath", "breathing difficulty", "breathless", "dyspnea"])) {
      detected.push({ name: "breathing difficulty", confidence: 1 });
    }

    return detected;
  }

  extractRawParameters(text) {
    const breathing = this.contains(text, ["shortness of breath", "breathing difficulty", "breathless", "dyspnea"]);

    return breathing
      ? {
          breathing_difficulty: { value: true, confidence: 1 }
        }
      : {};
  }

  normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();
  }

  contains(text, phrases = []) {
    return phrases.some(p => text.includes(p));
  }

  buildResponse(ruleResult) {
    const firstRule = ruleResult.triggeredRules?.[0];

    return {
      emergency: true,
      level: "EMERGENCY",
      message: "Seek immediate medical attention",
      reason: firstRule?.reason || "Emergency pattern detected"
    };
  }
}