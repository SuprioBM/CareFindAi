import { DOMAIN_CONFIG } from "../config/domain.config.js";

export class RuleEngine {
  constructor(state) {
    this.state = state;
    this.raw = state.rawParameters || {};
    this.symptoms = state.detectedSymptoms || [];
    this.domain = state.currentDomain || "general";
  }

  canonicalizeSymptomName(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  evaluate() {
    const rules = [
      ...this.checkGlobalRules(),
      ...this.checkDomainRules()
    ];

    return {
      override: this.hasEmergency(rules),
      level: this.getHighestLevel(rules),
      triggeredRules: rules
    };
  }

  /**
   * GLOBAL RULES (STRUCTURED ONLY)
   */
  checkGlobalRules() {
    const triggered = [];

    const symptomNames = this.symptoms
      .map((symptom) => (typeof symptom === "string" ? symptom : symptom.name))
      .filter(Boolean)
      .map((name) => this.canonicalizeSymptomName(name));

    if (symptomNames.includes("unconscious") || symptomNames.includes("loss of consciousness")) {
      triggered.push({
        rule: "LOSS_OF_CONSCIOUSNESS",
        level: "EMERGENCY",
        reason: "Loss of consciousness pattern"
      });
    }

    if (symptomNames.includes("not breathing")) {
      triggered.push({
        rule: "RESPIRATORY_ARREST_PATTERN",
        level: "EMERGENCY",
        reason: "Not breathing pattern"
      });
    }

    if (symptomNames.includes("severe bleeding")) {
      triggered.push({
        rule: "SEVERE_BLEEDING_PATTERN",
        level: "EMERGENCY",
        reason: "Severe bleeding pattern"
      });
    }

    if (symptomNames.includes("stroke") || symptomNames.includes("stroke symptoms")) {
      triggered.push({
        rule: "STROKE_DECLARATION",
        level: "EMERGENCY",
        reason: "Patient reports stroke symptoms"
      });
    }

    // 🚨 HEART PATTERN (from symptoms only)
    if (
      symptomNames.includes("chest pain") &&
      symptomNames.includes("jaw pain")
    ) {
      triggered.push({
        rule: "HEART_ATTACK_PATTERN",
        level: "EMERGENCY",
        reason: "Chest pain + jaw pain"
      });
    }

    // 🚨 STROKE PATTERN
    if (
      (
        symptomNames.includes("speech issue") ||
        symptomNames.includes("speech_issue") ||
        symptomNames.includes("slurred speech")
      ) &&
      (
        symptomNames.includes("weakness_one_side") ||
        symptomNames.includes("weakness one side") ||
        symptomNames.includes("one sided weakness")
      )
    ) {
      triggered.push({
        rule: "STROKE_PATTERN",
        level: "EMERGENCY",
        reason: "Speech issue + unilateral weakness"
      });
    }

    // 🚨 BREATHING FAILURE (STRUCTURED ONLY)
    const breathing = this.raw.breathing_difficulty;

    if (
      breathing?.value === true &&
      (breathing?.confidence ?? 0) >= 0.75
    ) {
      triggered.push({
        rule: "RESPIRATORY_DISTRESS",
        level: "EMERGENCY",
        reason: "High confidence breathing difficulty"
      });
    }

    return triggered;
  }

  /**
   * DOMAIN RULES
   */
  checkDomainRules() {
    const triggered = [];

    if (this.domain === "cardiovascular") {
      const pain = this.raw.pain_severity;
      const radiation = this.raw.pain_radiation;

      if (
        pain?.value >= 8 &&
        radiation?.value === true &&
        (pain?.confidence ?? 0) >= 0.7 &&
        (radiation?.confidence ?? 0) >= 0.7
      ) {
        triggered.push({
          rule: "SEVERE_CHEST_RADIATION",
          level: "HIGH",
          reason: "Severe chest pain with radiation"
        });
      }
    }

    return triggered;
  }

  hasEmergency(rules) {
    return rules.some(r => r.level === "EMERGENCY");
  }

  getHighestLevel(rules) {
    if (rules.some(r => r.level === "EMERGENCY")) return "EMERGENCY";
    if (rules.some(r => r.level === "HIGH")) return "HIGH";
    if (rules.some(r => r.level === "MEDIUM")) return "MEDIUM";
    return "LOW";
  }
}