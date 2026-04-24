import { randomUUID } from "crypto";
import { SessionService } from "../services/session.service.js";
import { StateMachineService } from "../services/stateMachine.service.js";
import { ScoringEngine } from "../engine/scoringEngine.js";
import { AIService } from "../services/ai.service.js";
import { LLMService } from "../services/llm.service.js";
import { DOMAIN_CONFIG } from "../config/domain.config.js";
import { RuleEngine } from "../engine/ruleEngine.js";
import { EarlyEmergencyService } from "../services/earlyEmergency.service.js";
import { DispositionEngine } from "../engine/dispositionEngine.js";
import { SpecialtyMapper } from "../middleware/SpecialtyMapper.js";
import { SpecialityService } from "../services/speciality.service.js";

const aiService = new AIService();
const sessionService = new SessionService();
const llmService = new LLMService();
const earlyEmergencyService = new EarlyEmergencyService();
const specialityService = new SpecialityService();

function parseBinaryAnswer(message = "") {
  const normalized = String(message).trim().toLowerCase();
  if (["yes", "y", "true", "1"].includes(normalized)) return true;
  if (["no", "n", "false", "0"].includes(normalized)) return false;
  return null;
}

function buildSpecialties(ruleResult, mappedSpecialties = []) {
  const rules = ruleResult?.triggeredRules || [];
  const hasStrokeRule = rules.some(
    (rule) => rule?.rule === "STROKE_DECLARATION" || rule?.rule === "STROKE_PATTERN"
  );

  if (hasStrokeRule) {
    return ["Neurology", "Neurosurgery", "Emergency Medicine", "General Physician"];
  }

  return mappedSpecialties;
}

function mergeForRuleEvaluation(currentState = {}, extracted = {}) {
  const mergedSymptoms = new Map();

  const addSymptom = (symptom) => {
    if (!symptom) return;

    const name = typeof symptom === "string" ? symptom : symptom.name;
    if (!name) return;

    const key = String(name).toLowerCase().trim();
    const confidence =
      typeof symptom === "object" && typeof symptom.confidence === "number"
        ? symptom.confidence
        : 0.5;

    const prev = mergedSymptoms.get(key);
    if (!prev || confidence > prev.confidence) {
      mergedSymptoms.set(key, { name: key, confidence });
    }
  };

  (currentState.detectedSymptoms || []).forEach(addSymptom);
  (extracted.detectedSymptoms || []).forEach(addSymptom);

  const rawParameters = { ...(currentState.rawParameters || {}) };
  const collectedParameters = { ...(currentState.collectedParameters || {}) };

  for (const [key, value] of Object.entries(extracted.extractedData || {})) {
    if (value && typeof value === "object" && "value" in value) {
      rawParameters[key] = {
        value: value.value,
        confidence: typeof value.confidence === "number" ? value.confidence : 0.5
      };
      collectedParameters[key] = value.value;
    } else {
      collectedParameters[key] = value;
    }
  }

  return {
    ...currentState,
    detectedSymptoms: Array.from(mergedSymptoms.values()),
    rawParameters,
    collectedParameters
  };
}

function shapeFinalResponse({ disposition, domainScores, specialties }) {
  return {
    triage_level: disposition.triage_level,
    confidence: disposition.confidence,
    domains: domainScores,
    reasons: disposition.reasons,
    next_step: disposition.next_step,
    specialties
  };
}

function shapeEmergencyResponse(emergency) {
  return {
    triage_level: "EMERGENCY",
    confidence: 1,
    domains: {},
    reasons: [emergency.reason || emergency.message || "Emergency pattern detected"],
    next_step: emergency.message || "Seek emergency medical care immediately",
    specialties: ["Emergency Medicine", "General Physician"]
  };
}

/**
 * MAIN TRIAGE CONTROLLER
 */
export const handleTriageMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        triage_level: "LOW",
        confidence: 0,
        domains: {},
        reasons: ["sessionId and message are required"],
        next_step: "Provide valid sessionId and message",
        specialties: ["General Physician"]
      });
    }

    // 1. SESSION
    const sessionData = await sessionService.getSession(sessionId);

    if (!sessionData) {
      return res.status(404).json({
        triage_level: "LOW",
        confidence: 0,
        domains: {},
        reasons: ["Session not found. Start a new triage session"],
        next_step: "Call /api/v1/triage/start",
        specialties: ["General Physician"]
      });
    }

    // 🚨 EARLY EMERGENCY CHECK
    const emergency = earlyEmergencyService.check(message);

    if (emergency) {
      return res.json(shapeEmergencyResponse(emergency));
    }

    // 2. LLM EXTRACTION
    let extracted = null;

    const pendingQuestionKey = sessionData.state?.nextQuestion?.key;
    const binaryAnswer = parseBinaryAnswer(message);

    if (pendingQuestionKey && binaryAnswer !== null) {
      extracted = {
        detectedSymptoms: [],
        extractedData: {
          [pendingQuestionKey]: {
            value: binaryAnswer,
            confidence: 1
          }
        }
      };
    } else {
      extracted = await llmService.parse(message, sessionData.state);
    }

    // 3. RULE ENGINE (DETECTION ONLY, USES LATEST EXTRACTED+STATE)
    const stateForRules = mergeForRuleEvaluation(sessionData.state, extracted);
    const ruleEngine = new RuleEngine(stateForRules);
    const ruleResult = ruleEngine.evaluate();

    // 4. STATE MACHINE UPDATE
    const stateMachine = new StateMachineService(sessionData);
    const updatedState = stateMachine.updateState(extracted, ruleResult);

    // 5. SCORING ENGINE (SIGNAL GENERATION ONLY)
    const scoringEngine = new ScoringEngine(updatedState);
    const scoreResult = scoringEngine.calculate();

    // 6. DISPOSITION ENGINE (FINAL BRAIN)
    const dispositionEngine = new DispositionEngine({
      domainScores: scoreResult.domainScores,
      ruleResult,
      collectedParameters: updatedState.collectedParameters,
      symptoms: updatedState.detectedSymptoms,
      domainInsights: updatedState.domainInsights
    });

    const disposition = dispositionEngine.evaluate();

    // 7. SPECIALTY MAPPER (SEPARATE LAYER)
    const specialtyMapper = new SpecialtyMapper();

    const mappedSpecialties = specialtyMapper.map(disposition.top_domains);
    const specialties = buildSpecialties(ruleResult, mappedSpecialties);

    // 8. NEXT QUESTION LOGIC
    const nextTarget = updatedState.shouldStop
      ? null
      : stateMachine.getNextQuestionTarget();

    let nextQuestion = null;

    const targetDomain = nextTarget?.domain || updatedState.currentDomain;

    if (nextTarget?.key && targetDomain) {
      const paramConfig =
        DOMAIN_CONFIG[targetDomain]?.parameters?.[
          nextTarget.key
        ];

      if (paramConfig) {
        nextQuestion = aiService.generateQuestion(
          targetDomain,
          nextTarget.key,
          paramConfig
        );
      }
    }

    updatedState.nextQuestion = nextQuestion;

    const matchedDoctors = await specialityService.matchBySpecialties(specialties);
    updatedState.matchedDoctors = matchedDoctors;
    updatedState.matchedDoctorCount = matchedDoctors.length;

    // 9. SESSION UPDATE
    sessionData.history.push({
      message,
      extracted,
      timestamp: Date.now()
    });

    sessionData.state = updatedState;

    await sessionService.saveSession(sessionId, sessionData);
    await sessionService.refreshSession(sessionId);

    const triageResult = shapeFinalResponse({
      disposition,
      domainScores: scoreResult.domainScores,
      specialties
    });

    return res.json({
      sessionId,
      state: updatedState,
      nextQuestion,
      triageResult,
      ...triageResult
    });

  } catch (err) {
    console.error("Triage Error:", err);
    return res.status(500).json({
      triage_level: "LOW",
      confidence: 0,
      domains: {},
      reasons: ["Internal server error"],
      next_step: "Try again later",
      specialties: ["General Physician"]
    });
  }
};


/**
 * START TRIAGE
 */
export const startTriage = async (req, res) => {
  try {
    const { sessionId: providedSessionId, message, text, age, gender, duration } = req.body;
    const inputMessage = (message || text || "").trim();

    if (!inputMessage) {
      return res.status(400).json({
        triage_level: "LOW",
        confidence: 0,
        domains: {},
        reasons: ["message or text is required"],
        next_step: "Provide symptom details to start triage",
        specialties: ["General Physician"]
      });
    }

    const sessionId =
      typeof providedSessionId === "string" && providedSessionId.trim().length > 0
        ? providedSessionId.trim()
        : randomUUID();
    const sessionData = sessionService.createNewSession();

    if (age !== undefined) sessionData.state.collectedParameters.age = age;
    if (gender !== undefined) sessionData.state.collectedParameters.gender = gender;
    if (duration !== undefined) sessionData.state.collectedParameters.duration = duration;

    const emergency = earlyEmergencyService.check(inputMessage);

    if (emergency) {
      sessionData.history.push({
        message: inputMessage,
        extracted: null,
        timestamp: Date.now()
      });

      await sessionService.saveSession(sessionId, sessionData);
      await sessionService.refreshSession(sessionId);

      const triageResult = shapeEmergencyResponse(emergency);

      res.set("x-session-id", sessionId);
      return res.json({
        sessionId,
        session: sessionData,
        state: sessionData.state,
        nextQuestion: null,
        triageResult,
        ...triageResult
      });
    }

    const extracted = await llmService.parse(inputMessage, sessionData.state);

    const stateForRules = mergeForRuleEvaluation(sessionData.state, extracted);
    const ruleEngine = new RuleEngine(stateForRules);
    const ruleResult = ruleEngine.evaluate();

    const stateMachine = new StateMachineService(sessionData);
    const updatedState = stateMachine.updateState(extracted, ruleResult);

    const scoringEngine = new ScoringEngine(updatedState);
    const scoreResult = scoringEngine.calculate();

    const dispositionEngine = new DispositionEngine({
      domainScores: scoreResult.domainScores,
      ruleResult,
      collectedParameters: updatedState.collectedParameters,
      symptoms: updatedState.detectedSymptoms,
      domainInsights: updatedState.domainInsights
    });

    const disposition = dispositionEngine.evaluate();

    const specialtyMapper = new SpecialtyMapper();
    const mappedSpecialties = specialtyMapper.map(disposition.top_domains);
    const specialties = buildSpecialties(ruleResult, mappedSpecialties);

    const nextTarget = updatedState.shouldStop
      ? null
      : stateMachine.getNextQuestionTarget();

    let nextQuestion = null;

    const targetDomain = nextTarget?.domain || updatedState.currentDomain;

    if (nextTarget?.key && targetDomain) {
      const paramConfig =
        DOMAIN_CONFIG[targetDomain]?.parameters?.[nextTarget.key];

      if (paramConfig) {
        nextQuestion = aiService.generateQuestion(
          targetDomain,
          nextTarget.key,
          paramConfig
        );
      }
    }

    updatedState.nextQuestion = nextQuestion;

    const matchedDoctors = await specialityService.matchBySpecialties(specialties);
    updatedState.matchedDoctors = matchedDoctors;
    updatedState.matchedDoctorCount = matchedDoctors.length;

    sessionData.history.push({
      message: inputMessage,
      extracted,
      timestamp: Date.now()
    });

    sessionData.state = updatedState;

    await sessionService.saveSession(sessionId, sessionData);
    await sessionService.refreshSession(sessionId);

    const triageResult = shapeFinalResponse({
      disposition,
      domainScores: scoreResult.domainScores,
      specialties
    });

    res.set("x-session-id", sessionId);
    return res.json({
      sessionId,
      session: sessionData,
      state: updatedState,
      nextQuestion,
      triageResult,
      ...triageResult
    });

  } catch (err) {
    console.error("Start Error:", err);
    return res.status(500).json({
      triage_level: "LOW",
      confidence: 0,
      domains: {},
      reasons: ["Internal server error"],
      next_step: "Try again later",
      specialties: ["General Physician"]
    });
  }
};