import {
  ALLOWED_SPECIALISTS,
  DEFAULT_WARNING,
  FALLBACK_SPECIALIST,
  HIGH_RISK_KEYWORDS,
} from "./ai.constants.js";

function containsHighRiskKeywords(text) {
  const lower = text.toLowerCase();
  return HIGH_RISK_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function normalizeUrgency(value) {
  const allowed = ["low", "medium", "high", "emergency"];
  return allowed.includes(value) ? value : "medium";
}

export function runBackendCheck({ userSymptoms, analysis }) {
  let specialist = analysis.specialist;
  let urgency = normalizeUrgency(analysis.urgency);
  let warningMessage = analysis.warningMessage?.trim() || DEFAULT_WARNING;
  let explanation = analysis.explanation?.trim() || "";
  let matchedSymptoms = Array.isArray(analysis.matchedSymptoms)
    ? analysis.matchedSymptoms
    : [];

  if (!ALLOWED_SPECIALISTS.includes(specialist)) {
    specialist = FALLBACK_SPECIALIST;
  }

  if (!explanation) {
    explanation =
      "Based on the symptom pattern, this specialist appears most relevant.";
  }

  if (containsHighRiskKeywords(userSymptoms)) {
    if (urgency === "low" || urgency === "medium") {
      urgency = "high";
    }

    warningMessage =
      "Some symptoms may need urgent medical attention. If symptoms are severe, worsening, or sudden, seek emergency care immediately.";
  }

  if (urgency === "emergency") {
    warningMessage =
      "This may require emergency medical attention. Please seek immediate care or contact emergency services right away.";
  }

  if (urgency === "high" && !warningMessage) {
    warningMessage =
      "Please seek urgent medical care if symptoms are severe or getting worse.";
  }

  return {
    specialist,
    explanation,
    urgency,
    warningMessage,
    matchedSymptoms,
    canShowDoctors: true,
  };
}