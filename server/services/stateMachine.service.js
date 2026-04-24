import { DOMAIN_CONFIG } from "../config/domain.config.js";


export class StateMachineService {
  constructor(session) {
    this.session = session;

    this.state = session.state || {
      domains: {},
      collectedParameters: {},
      rawParameters: {},

      missingParameters: [],
      currentDomain: null,
      selectedDomains: [],
      domainInsights: {},
      stage: "initial",

      detectedSymptoms: [],
      askedParameters: {}
    };

    // SYMPTOM SYNONYM MAP (2.2)
    this.symptomSynonyms = {
      "shortness of breath": "breathing difficulty",
      "breathless": "breathing difficulty",
      "breathlessness": "breathing difficulty",
      "dyspnea": "breathing difficulty",
      "difficulty breathing": "breathing difficulty",
      "trouble breathing": "breathing difficulty",

      "chest discomfort": "chest pain",
      "tight chest": "chest pain",
      "chest pain": "chest pain",
      "chestpain": "chest pain",
      "chest pain": "chest pain",
      "heartache": "chest pain",
      "heart ache": "chest pain",

      "stroke": "stroke symptoms",
      "having stroke": "stroke symptoms",
      "left arm numb": "weakness one side",
      "left arm numbness": "weakness one side",
      "arm numbness": "weakness one side",
      "numb left arm": "weakness one side",
      "one sided numbness": "weakness one side",
      "unilateral numbness": "weakness one side",
      "left arms feels numb": "weakness one side",

      "one sided weakness": "weakness one side",
      "weakness on one side": "weakness one side",

      "speech problem": "speech issue",
      "slurred speech": "speech issue",

      "skin rashes": "skin rash",
      "weird skin rashes": "skin rash",
      "rashes": "skin rash",
      "very tired": "fatigue",
      "extremely tired": "fatigue",
      "body aches": "body ache"
    };

    this.parameterSynonyms = {
      arm_numbness: "arm_numbness",
      left_arm_numbness: "arm_numbness",
      left_arm_numb: "arm_numbness",
      one_sided_numbness: "weakness_one_side",
      unilateral_numbness: "weakness_one_side",
      speech_problems: "speech_issue",
      slurred_speech: "speech_issue",
      chestpain: "chest_pain",
      pain_radiating: "pain_radiation",
      radiating_pain: "pain_radiation",
      breathing_issue: "breathing_difficulty"
    };
  }

  canonicalizeSymptomName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  canonicalizeParameterKey(value) {
    const normalized = String(value || "")
      .toLowerCase()
      .replace(/[\s-]+/g, "_")
      .replace(/_+/g, "_")
      .trim();

    return this.parameterSynonyms[normalized] || normalized;
  }

  /**
   * MAIN UPDATE PIPELINE
   */
updateState(userInputAnalysis, ruleResult = null) {
  const { detectedSymptoms = [], extractedData = {} } = userInputAnalysis;

  const newSymptoms = this.normalizeSymptoms(detectedSymptoms);

  this.state.detectedSymptoms =
    this.mergeSymptoms(this.state.detectedSymptoms, newSymptoms);

  this.mergeParameters(extractedData);
  this.detectDomains(this.state.detectedSymptoms);
  this.computeMissingParameters();

  // 🔥 3.1 STOP CONDITION FLAG (store it in state)
  this.state.shouldStop = this.shouldStop(ruleResult);
  this.state.stage = this.state.shouldStop ? "final" : "questioning";

  return this.state;
}

shouldStop(ruleResult) {
  const topDomainScore = this.getTopDomainScore();
  const topDomain = this.state.selectedDomains?.[0] || this.state.currentDomain;
  const topInsight = topDomain ? this.state.domainInsights?.[topDomain] : null;
  const selectedDomains = this.state.selectedDomains?.length
    ? this.state.selectedDomains
    : [topDomain].filter(Boolean);

  // 1. RuleEngine emergency override
  if (ruleResult?.override === true) {
    return true;
  }

  const criticalMissingAcrossSelected = this.state.missingParameters.filter(
    p => selectedDomains.includes(p.domain) && p.importance === "critical"
  );

  const parameterCompleteness = topInsight?.parameterCompleteness ?? 0;

  // 2. Never stop while critical questions are still unanswered.
  if (criticalMissingAcrossSelected.length > 0) {
    return false;
  }

  // 3. Domain highly confident with enough data
  if (topDomainScore >= 0.9 && parameterCompleteness >= 0.6) {
    return true;
  }

  // 4. Top domain has enough required/high-value data
  if (parameterCompleteness >= 0.8) {
    return true;
  }

  // 5. No meaningful questions left
  if (this.state.missingParameters.length === 0) {
    return true;
  }

  return false;
}


getTopDomainScore() {
  const topDomain = this.state.selectedDomains?.[0] || this.state.currentDomain;
  if (!topDomain) return 0;
  return this.state.domainInsights?.[topDomain]?.confidence ?? 0;
}
  /**
   * ✅ SYMPTOM NORMALIZATION (2.2)
   */
  normalizeSymptoms(symptoms) {
    const normalizedMap = new Map();

    for (const symptom of symptoms || []) {
      const rawName = typeof symptom === "string" ? symptom : symptom?.name;
      if (!rawName) continue;

      let normalizedName = this.canonicalizeSymptomName(rawName);
      if (this.symptomSynonyms[normalizedName]) {
        normalizedName = this.symptomSynonyms[normalizedName];
      }

      const confidence =
        typeof symptom === "object" && typeof symptom.confidence === "number"
          ? symptom.confidence
          : 0.5;

      const existing = normalizedMap.get(normalizedName);
      if (!existing || confidence > existing.confidence) {
        normalizedMap.set(normalizedName, {
          name: normalizedName,
          confidence
        });
      }
    }

    return Array.from(normalizedMap.values());
  }

  /**
   * 🔥 2.3 FIX: MERGE + DEDUPE SYMPTOMS
   */
  mergeSymptoms(oldSymptoms, newSymptoms) {
    const map = new Map();

    // add old symptoms
    for (const symptom of oldSymptoms || []) {
      if (!symptom) continue;

      const name = typeof symptom === "string" ? symptom : symptom.name;
      if (!name) continue;

      const key = this.canonicalizeSymptomName(name);
      const confidence =
        typeof symptom === "object" && typeof symptom.confidence === "number"
          ? symptom.confidence
          : 0.5;

      map.set(key, { name: key, confidence });
    }

    // merge new symptoms (preserve stronger confidence)
    for (const symptom of newSymptoms || []) {
      if (!symptom) continue;

      const name = typeof symptom === "string" ? symptom : symptom.name;
      if (!name) continue;

      const key = this.canonicalizeSymptomName(name);
      const confidence =
        typeof symptom === "object" && typeof symptom.confidence === "number"
          ? symptom.confidence
          : 0.5;

      const existing = map.get(key);
      if (!existing || confidence > existing.confidence) {
        map.set(key, { name: key, confidence });
      }
    }

    return Array.from(map.values());
  }

  /**
   * DOMAIN DETECTION
   */
  /**
   * DOMAIN DETECTION (2.4 FIXED: CONFIDENCE-WEIGHTED)
   */
  detectDomains(symptoms) {
    const domainScores = {};
    const domainInsights = {};

    for (const [domainKey, domain] of Object.entries(DOMAIN_CONFIG)) {
      if (domainKey === "general") {
        continue;
      }

      const domainSymptomSet = new Set(
        (domain.symptoms || []).map((item) => this.canonicalizeSymptomName(item))
      );

      let weightedSymptomHits = 0;
      let matchedSymptomCount = 0;

      for (const symptom of symptoms || []) {
        const normalizedName = this.canonicalizeSymptomName(symptom?.name || symptom);
        if (!normalizedName) continue;

        if (domainSymptomSet.has(normalizedName)) {
          matchedSymptomCount += 1;
          weightedSymptomHits += symptom?.confidence ?? 0.5;
        }
      }

      const requiredKeys = Object.entries(domain.parameters || {})
        .filter(([, paramConfig]) => Boolean(paramConfig?.required))
        .map(([key]) => key);

      const trackedKeys = Object.entries(domain.parameters || {})
        .filter(([, paramConfig]) => {
          return Boolean(paramConfig?.required) ||
            ["critical", "high"].includes(paramConfig?.importance);
        })
        .map(([key]) => key);

      const filledRequiredCount = requiredKeys.filter((key) => {
        const value = this.state.collectedParameters[key];
        return value !== undefined && value !== null && value !== "";
      }).length;

      const filledTrackedCount = trackedKeys.filter((key) => {
        const value = this.state.collectedParameters[key];
        return value !== undefined && value !== null && value !== "";
      }).length;

      const parameterCompleteness =
        trackedKeys.length > 0 ? filledTrackedCount / trackedKeys.length : 0;

      const symptomMatchStrength =
        matchedSymptomCount > 0 ? Math.min(weightedSymptomHits / 2, 1) : 0;

      const confidence =
        (symptomMatchStrength * 0.75 + parameterCompleteness * 0.25) *
        (domain.weight ?? 1);

      domainScores[domainKey] = Number(Math.max(confidence, 0).toFixed(4));
      domainInsights[domainKey] = {
        symptomMatchStrength,
        parameterCompleteness,
        confidence: Number(Math.max(confidence, 0).toFixed(4)),
        matchedSymptomCount,
        requiredCount: requiredKeys.length,
        filledRequiredCount,
        missingRequiredCount: Math.max(requiredKeys.length - filledRequiredCount, 0),
        trackedCount: trackedKeys.length,
        filledTrackedCount
      };
    }

    const orderedDomains = Object.entries(domainInsights)
      .sort((a, b) => b[1].confidence - a[1].confidence)
      .map(([key]) => key);

    const selectedDomains = orderedDomains
      .filter((domainKey) => {
        const insight = domainInsights[domainKey];
        return insight.confidence >= 0.2 || insight.matchedSymptomCount > 0;
      })
      .slice(0, 2);

    this.state.domains = domainScores;
    this.state.domainInsights = domainInsights;
    this.state.selectedDomains = selectedDomains.length
      ? selectedDomains
      : [orderedDomains[0] || "general"];

    this.state.currentDomain = this.state.selectedDomains[0] || "general";
  }

  /**
   * PARAMETER MERGE
   */
  mergeParameters(extractedData) {
    const normalized = {};

    for (const [key, value] of Object.entries(extractedData || {})) {
      const normalizedKey = this.canonicalizeParameterKey(key);

      if (value && typeof value === "object" && "value" in value) {
        this.state.rawParameters[normalizedKey] = {
          value: value.value,
          confidence: value.confidence ?? 0.5
        };

        normalized[normalizedKey] = value.value;
      } else {
        normalized[normalizedKey] = value;
      }
    }

    this.state.collectedParameters = {
      ...this.state.collectedParameters,
      ...normalized
    };
  }

  /**
   * MISSING PARAMETERS
   */
  computeMissingParameters() {
    const selectedDomains = this.state.selectedDomains?.length
      ? this.state.selectedDomains
      : [this.state.currentDomain || "general"];

    const missingByKey = new Map();

    for (const domainKey of selectedDomains) {
      const domainConfig = DOMAIN_CONFIG[domainKey];
      if (!domainConfig) continue;

      for (const [paramKey, paramConfig] of Object.entries(domainConfig.parameters || {})) {
        const value = this.state.collectedParameters[paramKey];
        const exists = value !== undefined && value !== null && value !== "";

        const askable =
          Boolean(paramConfig.required) ||
          ["critical", "high"].includes(paramConfig.importance);

        if (!askable || exists) {
          continue;
        }

        const current = missingByKey.get(paramKey);
        const domainConfidence = this.state.domainInsights?.[domainKey]?.confidence ?? 0;

        const candidate = {
          domain: domainKey,
          key: paramKey,
          importance: paramConfig.importance || "medium",
          required: Boolean(paramConfig.required),
          type: paramConfig.type,
          domainConfidence
        };

        if (!current) {
          missingByKey.set(paramKey, candidate);
          continue;
        }

        if (candidate.domainConfidence > current.domainConfidence) {
          missingByKey.set(paramKey, candidate);
        }
      }
    }

    this.state.missingParameters = Array.from(missingByKey.values());
  }

  /**
   * NEXT QUESTION
   */
getNextQuestionTarget() {
  const sorted = [...this.state.missingParameters].map(p => {
    const askedCount = this.state.askedParameters?.[p.key] || 0;

    const importanceScore = {
      critical: 3,
      high: 2,
      medium: 1,
      low: 0
    }[p.importance] || 0;

    const domainConfidenceBoost = (p.domainConfidence || 0) * 2;
    const requiredBoost = p.required ? 1 : 0;
    const retryPenalty = askedCount >= 2 ? 2 : askedCount * 0.8;

    const score =
      importanceScore +
      domainConfidenceBoost +
      requiredBoost -
      retryPenalty;

    return { ...p, score };
  });

  sorted.sort((a, b) => b.score - a.score);

  const selected = sorted[0] || null;
  if (!selected) {
    return null;
  }

  this.state.askedParameters = {
    ...(this.state.askedParameters || {}),
    [selected.key]: (this.state.askedParameters?.[selected.key] || 0) + 1
  };

  return selected;
}

  getState() {
    return this.state;
  }
}