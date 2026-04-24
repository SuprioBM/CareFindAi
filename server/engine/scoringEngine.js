import { DOMAIN_CONFIG } from "../config/domain.config.js";

/**
 * Scoring Engine (PURE SCORING ONLY)
 */
export class ScoringEngine {
  constructor(state) {
    this.state = state;
    this.domains = state.domains || {};
    this.domainInsights = state.domainInsights || {};
    this.answers = state.collectedParameters || {};
    this.raw = state.rawParameters || {};
  }

  getConfidence(key) {
    return this.raw?.[key]?.confidence ?? 0.5;
  }

  /**
   * MAIN ENTRY
   */
  calculate() {
    const domainScores = this.calculateDomainScores();
    const severityScore = this.calculateSeverityScore();

    const sortedScores = Object.values(domainScores).sort((a, b) => b - a);
    const topDomainScore = sortedScores[0] || 0;
    const secondDomainScore = sortedScores[1] || 0;

    const finalScore = Math.min(
      this.normalize(topDomainScore) * 0.7 +
      this.normalize(secondDomainScore) * 0.15 +
      severityScore * 0.15,
      1
    );

    return {
      finalScore,
      domainScores,
      severityScore
    };
  }

  normalize(score) {
    return Math.min(score / 100, 1);
  }

  /**
   * DOMAIN SCORING
   */
  calculateDomainScores() {
    const scores = {};

    for (const [domainKey, domain] of Object.entries(DOMAIN_CONFIG)) {
      if (domainKey === "general") {
        continue;
      }

      const insight = this.domainInsights[domainKey] || {};
      const baseConfidence = insight.confidence ?? this.domains[domainKey] ?? 0;
      const parameterEvidence = this.calculateParameterEvidence(domain.parameters || {});

      const score = Math.min(
        baseConfidence * 80 +
        parameterEvidence * 20,
        100
      );

      scores[domainKey] = Number(score.toFixed(2));
    }

    if (!Object.keys(scores).length) {
      scores.general = 15;
    }

    return scores;
  }

  calculateParameterEvidence(parameters = {}) {
    const keys = Object.keys(parameters);
    if (!keys.length) return 0;

    let hit = 0;

    for (const key of keys) {
      const value = this.answers[key];
      if (value === undefined || value === null || value === "") {
        continue;
      }

      const confidence = this.getConfidence(key);
      const param = parameters[key] || {};

      if (param.type === "boolean") {
        if (value === true) {
          hit += 1 * confidence;
        }
        continue;
      }

      if (param.type === "scale") {
        const max = param.range?.[1] || 10;
        hit += Math.min(Number(value) / max, 1) * confidence;
        continue;
      }

      hit += 0.7 * confidence;
    }

    return Math.min(hit / keys.length, 1);
  }

  /**
   * PARAM SCORING
   */
  scoreParameter(param, value, key) {
    const confidence = this.getConfidence(key);
    let score = 0;

    if (param.type === "boolean") {
      if (value === true) {
        const base = param.importance === "critical" ? 25 : 10;
        score += base * confidence;
      }
    }

    if (param.type === "scale") {
      const max = param.range?.[1] || 10;
      score += ((value / max) * 20) * confidence;
    }

    if (param.type === "enum") {
      score += 10 * confidence;
    }

    return score;
  }

  /**
   * SEVERITY SCORE
   */
  calculateSeverityScore() {
    let score = 0;

    for (const [key, value] of Object.entries(this.answers)) {
      if (typeof value === "boolean" && value === true) {
        score += 0.08 * this.getConfidence(key);
      }

      if (typeof value === "number") {
        score += Math.min(value / 10, 1) * 0.1;
      }
    }

    return Math.min(score, 1);
  }

  /**
   * TOP DOMAIN
   */
  getTopDomainData() {
    const ordered = Object.entries(this.domainInsights)
      .sort((a, b) => (b[1].confidence || 0) - (a[1].confidence || 0));

    return DOMAIN_CONFIG[ordered[0]?.[0] || "general"];
  }

}