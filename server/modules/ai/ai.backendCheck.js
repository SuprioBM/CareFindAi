import {
  ALLOWED_SPECIALISTS,
  DEFAULT_WARNING,
  FALLBACK_SPECIALIST,
  HIGH_RISK_KEYWORDS,
} from "./ai.constants.js";

import {
  resolveCanonicalSpecializationName,
} from "./ai.specialization.js";

function containsHighRiskKeywords(text = "") {
  const lower = String(text).toLowerCase();
  return HIGH_RISK_KEYWORDS.some((keyword) => lower.includes(keyword));
}

function normalizeUrgency(value = "") {
  const allowed = ["low", "medium", "high", "emergency"];
  const normalized = String(value).toLowerCase().trim();
  return allowed.includes(normalized) ? normalized : "medium";
}

function normalizeSpecialistName(value = "") {
  return resolveCanonicalSpecializationName(value) || "";
}

function getDefaultExplanation(specialist) {
  return `Based on the symptom pattern, ${specialist} appears most relevant.`;
}

function getDefaultWarning() {
  return (
    DEFAULT_WARNING ||
    "This is not a medical diagnosis. Seek medical care if symptoms are severe or worsening."
  );
}

function getHighRiskWarning() {
  return "Some symptoms may need urgent medical attention. If symptoms are severe, worsening, or sudden, seek emergency care immediately.";
}

function getEmergencyWarning() {
  return "This may require emergency medical attention. Please seek immediate care or contact emergency services right away.";
}

function getHighUrgencyWarning() {
  return "Please seek urgent medical care if symptoms are severe or getting worse.";
}

export function runBackendCheck({
  userSymptoms,
  originalSymptoms,
  analysis,
}) {
  let specialist = normalizeSpecialistName(analysis?.specialist || "");
  let urgency = normalizeUrgency(analysis?.urgency);
  let warningMessage = String(analysis?.warningMessage || "").trim();
  let explanation = String(analysis?.explanation || "").trim();

  let matchedSymptoms = Array.isArray(analysis?.matchedSymptoms)
    ? analysis.matchedSymptoms
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

  if (!specialist || !ALLOWED_SPECIALISTS.includes(specialist)) {
    specialist = FALLBACK_SPECIALIST;
  }

  if (!explanation) {
    explanation = getDefaultExplanation(specialist);
  }

  const riskText = `${userSymptoms || ""} ${originalSymptoms || ""}`;

  if (containsHighRiskKeywords(riskText)) {
    if (urgency === "low" || urgency === "medium") {
      urgency = "high";
    }

    warningMessage = getHighRiskWarning();
  }

  if (urgency === "emergency") {
    warningMessage = getEmergencyWarning();
  }

  if (urgency === "high" && !warningMessage) {
    warningMessage = getHighUrgencyWarning();
  }

  if (!warningMessage) {
    warningMessage = getDefaultWarning();
  }

  if (!matchedSymptoms.length) {
    matchedSymptoms = [userSymptoms || originalSymptoms]
      .map((item) => String(item || "").trim())
      .filter(Boolean);
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