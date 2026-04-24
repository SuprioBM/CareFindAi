import { DOMAIN_CONFIG } from "../config/domain.config.js";

export class DispositionEngine {
  constructor({ domainScores, ruleResult, collectedParameters, symptoms, domainInsights }) {
    this.domainScores = domainScores || {};
    this.ruleResult = ruleResult || {};
    this.collectedParameters = collectedParameters || {};
    this.symptoms = symptoms || [];
    this.domainInsights = domainInsights || {};
  }

  evaluate() {
    const rankedDomains = this.getRankedDomains();
    const confirmedDomain = rankedDomains[0]?.domain || "general";
    const topDomains = rankedDomains.slice(0, 2).map((item) => item.domain);

    const finalScore = this.calculateRiskScore(confirmedDomain);
    const triage_level = this.mapToTriage(finalScore, confirmedDomain);
    const reasons = this.generateReasons(confirmedDomain, topDomains, triage_level);

    return {
      triage_level,
      confidence: this.calculateConfidence(finalScore, confirmedDomain),

      top_domains: topDomains,
      confirmed_domain: confirmedDomain,

      reasons,

      next_step: this.generateNextStep(triage_level),

      explanation_level: {
        simple: this.generateSimpleExplanation(triage_level, confirmedDomain),
        detailed: this.generateDetailedExplanation(confirmedDomain, reasons)
      }
    };
  }

  canonicalizeSymptomName(name) {
    return String(name || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  getNormalizedSymptomNames() {
    return this.symptoms
      .map((symptom) => (typeof symptom === "string" ? symptom : symptom?.name))
      .filter(Boolean)
      .map((name) => this.canonicalizeSymptomName(name));
  }

  getRankedDomains() {
    const domainKeys = new Set([
      ...Object.keys(this.domainScores || {}),
      ...Object.keys(this.domainInsights || {})
    ]);

    const ranked = [];

    for (const domainKey of domainKeys) {
      if (domainKey === "general") continue;

      const scoreSignal = this.normalize(this.domainScores?.[domainKey] || 0);
      const insight = this.domainInsights?.[domainKey] || {};
      const confidenceSignal = insight.confidence || 0;
      const completenessSignal = insight.parameterCompleteness || 0;
      const symptomSignal = insight.symptomMatchStrength || 0;

      const combined =
        scoreSignal * 0.5 +
        confidenceSignal * 0.3 +
        completenessSignal * 0.1 +
        symptomSignal * 0.1;

      ranked.push({
        domain: domainKey,
        combined
      });
    }

    ranked.sort((a, b) => b.combined - a.combined);
    return ranked.filter((item) => item.combined > 0.05);
  }

  getConfirmedDomain() {
    return this.getRankedDomains()[0]?.domain || "general";
  }

  normalize(score) {
    const numeric = Number(score) || 0;
    return Math.max(0, Math.min(numeric / 100, 1));
  }

  calculateRiskScore(confirmedDomain) {
    if (this.ruleResult?.override) {
      return 1;
    }

    const domainConfig = DOMAIN_CONFIG[confirmedDomain] || {};
    const insight = this.domainInsights?.[confirmedDomain] || {};
    const domainSignal = Math.max(
      this.normalize(this.domainScores?.[confirmedDomain] || 0),
      insight.confidence || 0
    );

    const ruleImpact = this.getRuleImpact();
    const symptomBurden = Math.min(this.getNormalizedSymptomNames().length * 0.08, 0.28);
    const parameterRisk = this.calculateParameterRisk(domainConfig);
    const redFlagRisk = this.calculateRedFlagRisk(domainConfig);
    const clusterRisk = this.calculateClusterRisk();

    return Math.min(
      ruleImpact +
      symptomBurden +
      parameterRisk +
      redFlagRisk +
      clusterRisk +
      domainSignal * 0.2,
      1
    );
  }

  calculateParameterRisk(domainConfig = {}) {
    let risk = 0;
    const parameters = domainConfig.parameters || {};

    for (const [key, config] of Object.entries(parameters)) {
      const value = this.collectedParameters[key];
      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (config.type === "boolean" && value === true) {
        risk += config.importance === "critical" ? 0.2 : 0.1;
        continue;
      }

      if (config.type === "scale" && typeof value === "number") {
        const max = config.range?.[1] || 10;
        const scaled = Math.min(value / max, 1);
        risk += scaled * (config.importance === "critical" ? 0.2 : 0.1);
        continue;
      }

      if (config.type === "enum") {
        risk += config.importance === "critical" ? 0.1 : 0.05;
      }
    }

    return Math.min(risk, 0.4);
  }

  calculateRedFlagRisk(domainConfig = {}) {
    const symptoms = new Set(this.getNormalizedSymptomNames());
    const redFlags = (domainConfig.redFlags || []).map((flag) => this.canonicalizeSymptomName(flag));

    const matches = redFlags.filter((flag) => symptoms.has(flag)).length;
    return Math.min(matches * 0.15, 0.3);
  }

  calculateClusterRisk() {
    const symptoms = new Set(this.getNormalizedSymptomNames());
    const hasStrokeSignals =
      symptoms.has("stroke symptoms") ||
      symptoms.has("weakness one side") ||
      symptoms.has("speech issue");
    const hasCardioSignals =
      symptoms.has("chest pain") ||
      symptoms.has("breathing difficulty") ||
      symptoms.has("shortness of breath");

    if (hasStrokeSignals && hasCardioSignals) return 0.2;
    if (hasStrokeSignals || hasCardioSignals) return 0.12;

    return 0;
  }

  getRuleImpact() {
    const rules = this.ruleResult?.triggeredRules || [];

    if (rules.length >= 2) return 0.35;
    if (rules.length === 1) return 0.2;

    return 0;
  }

  mapToTriage(score, confirmedDomain) {
    if (this.ruleResult?.override) return "EMERGENCY";

    const insight = this.domainInsights?.[confirmedDomain] || {};
    const hasCriticalGaps = (insight.missingRequiredCount || 0) > 0;

    if (score >= 0.78) return "HIGH";
    if (score >= 0.45) return "MEDIUM";

    if (!hasCriticalGaps && score >= 0.35) {
      return "MEDIUM";
    }

    return "LOW";
  }

  calculateConfidence(score, confirmedDomain) {
    const insight = this.domainInsights?.[confirmedDomain] || {};
    const completeness = insight.parameterCompleteness || 0;
    const confidence = score * 0.7 + completeness * 0.2 + (insight.confidence || 0) * 0.1;
    return Math.min(confidence, 1);
  }

  generateReasons(confirmedDomain, topDomains = [], triageLevel) {
    const reasons = [];
    const symptomText = this.describeSymptoms();
    const differentialText = this.describeDifferentialContext(confirmedDomain, topDomains, symptomText);
    const concernText = this.describeConcerningFindings(confirmedDomain);
    const specialistText = this.describeSpecialistChoice(confirmedDomain, triageLevel);

    if (differentialText) {
      reasons.push(differentialText);
    }

    if (concernText) {
      reasons.push(concernText);
    }

    reasons.push(specialistText);

    return reasons;
  }

  generateNextStep(level) {
    switch (level) {
      case "EMERGENCY":
        return "Seek emergency medical care immediately";

      case "HIGH":
        return "Consult a specialist within 24 hours";

      case "MEDIUM":
        return "Schedule a doctor visit soon";

      default:
        return "Monitor symptoms and continue assessment";
    }
  }

  generateSimpleExplanation(level, confirmedDomain) {
    const domainLabel = this.domainLabel(confirmedDomain);
    return `${level} urgency based on symptoms pointing to the ${domainLabel} system.`;
  }

  generateDetailedExplanation(confirmedDomain, reasons) {
    const domainLabel = this.domainLabel(confirmedDomain);

    return `
Main affected system: ${domainLabel}
Why this level was assigned: ${reasons.join(" ")}
The recommendation focuses on the most strongly supported domain instead of weak secondary signals.
    `.trim();
  }

  domainLabel(domainKey) {
    if (!domainKey || domainKey === "general") {
      return "general medical";
    }

    return domainKey.replace(/_/g, " ");
  }

  describeSymptoms() {
    const names = this.getNormalizedSymptomNames().slice(0, 4);
    if (!names.length) return "the symptoms you reported";
    return names.join(", ");
  }

  describeDifferentialContext(confirmedDomain, topDomains = [], symptomText = "") {
    const primary = this.domainLabel(confirmedDomain);
    const secondaryDomain = topDomains.find((domain) => domain !== confirmedDomain);

    if (!secondaryDomain) {
      return `Your current symptom pattern (${symptomText}) most strongly matches the ${primary} system.`;
    }

    const secondary = this.domainLabel(secondaryDomain);

    return `Your symptom pattern (${symptomText}) suggests a systemic condition. The strongest match is ${primary}, while ${secondary} is also being considered until more details are confirmed.`;
  }

  describeConcerningFindings(confirmedDomain) {
    const domain = DOMAIN_CONFIG[confirmedDomain] || {};
    const concerning = [];
    const missingHighValue = [];

    for (const [key, config] of Object.entries(domain.parameters || {})) {
      const value = this.collectedParameters[key];

      if ((value === undefined || value === null || value === "") &&
        (config.required || ["critical", "high"].includes(config.importance))) {
        missingHighValue.push(key.replace(/_/g, " "));
      }

      if (config.type === "boolean" && value === true) {
        concerning.push(key.replace(/_/g, " "));
      }

      if (config.type === "scale" && typeof value === "number" && value >= 7) {
        concerning.push(`${key.replace(/_/g, " ")} is high`);
      }
    }

    if (!concerning.length && missingHighValue.length) {
      return `We still need focused answers about ${missingHighValue.slice(0, 2).join(" and ")} to safely separate likely causes.`;
    }

    if (!concerning.length) {
      return "Current findings are moderate, but additional targeted answers are needed before final closure.";
    }

    return `Important warning signs include ${concerning.slice(0, 2).join(" and ")}, which increases concern.`;
  }

  describeSpecialistChoice(confirmedDomain, triageLevel) {
    const specialties = DOMAIN_CONFIG[confirmedDomain]?.specialties || ["General Physician"];
    const mainSpecialist = specialties[0];

    if (triageLevel === "EMERGENCY") {
      return `Because of the current risk level, emergency care should be prioritized immediately.`;
    }

    const article = /^[aeiou]/i.test(mainSpecialist) ? "An" : "A";
    return `${article} ${mainSpecialist} specialist is recommended now because this specialty best matches the strongest current evidence.`;
  }
}