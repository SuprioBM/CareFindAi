import { randomUUID } from "crypto";
import { SessionService } from "../services/session.service.js";
import { ExtractionLayer } from "../services/extractionLayer.service.js";
import { EmergencyLayer } from "../services/emergencyLayer.service.js";
import { MissingInfoEngine } from "../services/missingInfoEngine.service.js";
import { PriorityEngine } from "../services/priorityEngine.service.js";
import { QuestionGenerator } from "../services/questionGenerator.service.js";
import { DispositionEngine } from "../services/dispositionEngine.service.js";
import SymptomSearch from "../models/symptomSearch.model.js";
import { findOrCreateSpecialization } from "../utils/specializationFinder.js";

const sessionService = new SessionService();
const extractionLayer = new ExtractionLayer();
const emergencyLayer = new EmergencyLayer();
const missingInfoEngine = new MissingInfoEngine();
const priorityEngine = new PriorityEngine();
const questionGenerator = new QuestionGenerator();
const dispositionEngine = new DispositionEngine();

// Turn threshold to avoid excessive questioning
const MAX_QUESTIONS = 5;

/**
 * Helper to parse yes/no/binary answers
 */
function isPositiveAnswer(message = "") {
  const normalized = String(message).trim().toLowerCase();
  return ["yes", "y", "true", "1", "yeah", "yep", "i do", "correct", "always"].includes(normalized);
}

/**
 * Shape V3 Final Response for API compatibilities
 */
function shapeTriageResponse(session, nextQuestion = null, nextQuestionKey = null, recommendation = null) {
  let triageResult = null;

  if (recommendation) {
    triageResult = {
      urgency: recommendation.urgencyLevel.toUpperCase(),
      score: Math.round((recommendation.confidenceScore || 0.8) * 100),
      specialties: recommendation.specialties || [recommendation.specialist],
      next_step: recommendation.explanation,
      reasons: recommendation.warningMessage ? [recommendation.warningMessage] : [],
    };
  }

  return {
    success: true,
    sessionId: session.sessionId,
    status: session.status,
    clinicalState: session.clinicalState,
    nextQuestion: nextQuestion ? {
      question: nextQuestion,
      key: nextQuestionKey,
      options: nextQuestionKey && (nextQuestionKey.endsWith("_presence") || !nextQuestionKey.includes("_")) ? ["Yes", "No"] : []
    } : null,
    triageResult,
    // Keep backward compatible top-level properties
    triage_level: recommendation ? recommendation.urgencyLevel.toUpperCase() : "LOW",
    confidence: recommendation ? (recommendation.confidenceScore || 0.8) : 0,
    specialties: recommendation ? (recommendation.specialties || [recommendation.specialist]) : ["General Medicine"],
    next_step: recommendation ? recommendation.explanation : "",
    reasons: recommendation && recommendation.warningMessage ? [recommendation.warningMessage] : [],
  };
}

/**
 * START TRIAGE ENDPOINT
 */
export const startTriage = async (req, res) => {
  try {
    const { sessionId: providedSessionId, message, text, age, gender, duration } = req.body;
    const inputMessage = (message || text || "").trim();
    const userId = req.user.id; // Protected route

    if (!inputMessage) {
      return res.status(400).json({
        success: false,
        message: "Symptom description message is required to start triage.",
      });
    }

    const sessionId = providedSessionId && providedSessionId.trim().length > 0
      ? providedSessionId.trim()
      : randomUUID();

    // 1. Session Initialization
    let session = await sessionService.getSession(sessionId);
    if (!session) {
      session = sessionService.createNewSession(userId, sessionId);
    } else {
      // Reset if starting fresh with new messages
      session = await sessionService.resetSession(sessionId, userId);
    }

    // Capture initial demographics if passed
    if (age !== undefined && age !== null) {
      session.clinicalState.demographics.age = Number(age);
    }
    if (gender !== undefined && gender !== null) {
      session.clinicalState.demographics.gender = String(gender).trim().toLowerCase();
    }
    if (duration !== undefined && duration !== null && duration.trim().length > 0) {
      session.clinicalState.symptomTimeline.set("primary", String(duration).trim());
    }

    session.conversationHistory.push({
      role: "user",
      content: inputMessage,
    });

    // 2. Information Extraction
    const extracted = await extractionLayer.extract(inputMessage, session.clinicalState);
    session.clinicalState = extractionLayer.merge(session.clinicalState, extracted);

    // 3. Emergency Check
    const emergency = emergencyLayer.check(session.clinicalState);
    if (emergency.emergencyDetected) {
      const rec = await dispositionEngine.evaluate(session.clinicalState, true, emergency.emergencyReason);
      session.finalRecommendation = rec;
      session.status = "COMPLETED";

      await sessionService.saveSession(sessionId, session);
      return res.json(shapeTriageResponse(session, null, null, rec));
    }

    // 4. Missing Parameters & Prioritization
    const missing = missingInfoEngine.findMissing(session.clinicalState);
    const prioritized = priorityEngine.prioritize(missing);
    session.clinicalState.missingQuestions = prioritized.map((p) => p.key);

    // 5. Generate First Question or Finalize Triage
    if (prioritized.length > 0) {
      const nextQ = prioritized[0];
      const questionText = await questionGenerator.generateQuestion(nextQ.key, session.clinicalState);

      session.conversationHistory.push({
        role: "assistant",
        content: questionText,
      });

      await sessionService.saveSession(sessionId, session);
      return res.json(shapeTriageResponse(session, questionText, nextQ.key, null));
    } else {
      // Sufficient information immediately available
      const rec = await dispositionEngine.evaluate(session.clinicalState, false);
      session.finalRecommendation = rec;
      session.status = "COMPLETED";

      const specialization = await findOrCreateSpecialization(rec.specialist);
      await SymptomSearch.create({
        user: userId,
        symptomsText: inputMessage,
        inputLanguage: "en",
        recommendedSpecialization: specialization?._id || null,
        recommendedSpecializationName: specialization?.name || rec.specialist || "",
        analysisReason: rec.explanation,
        urgencyLevel: rec.urgencyLevel === "emergency" ? "emergency" : (rec.urgencyLevel === "urgent" ? "high" : "low"),
        warningMessage: rec.warningMessage || "",
        matchedSymptoms: rec.matchedSymptoms || [],
        canShowDoctors: rec.canShowDoctors,
        retrievalQuery: rec.specialist,
        qaHistory: [],
      });

      await sessionService.saveSession(sessionId, session);
      return res.json(shapeTriageResponse(session, null, null, rec));
    }
  } catch (error) {
    console.error("Start Triage Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize triage flow.",
      error: error.message,
    });
  }
};

/**
 * CONTINUE TRIAGE (PROCESS USER MESSAGES)
 */
export const handleTriageMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "sessionId and response message are required.",
      });
    }

    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Triage session not found. Start a new one.",
      });
    }

    if (session.status === "COMPLETED") {
      return res.json(shapeTriageResponse(session, null, null, session.finalRecommendation));
    }

    // 1. Identify what question was asked
    const askedQuestions = session.questionHistory || [];
    const missingKeys = session.clinicalState.missingQuestions || [];
    const pendingQuestionKey = missingKeys[0];

    session.conversationHistory.push({
      role: "user",
      content: message,
    });

    if (pendingQuestionKey) {
      // Mark as answered
      session.clinicalState.answeredQuestions.push(pendingQuestionKey);
      session.questionHistory.push({
        questionKey: pendingQuestionKey,
        text: session.conversationHistory[session.conversationHistory.length - 2]?.content || "",
        answer: message,
      });

      // Handle custom red flag question answers
      if (pendingQuestionKey.endsWith("_presence") || !pendingQuestionKey.includes("_")) {
        const isPositive = isPositiveAnswer(message);
        if (isPositive) {
          if (!session.clinicalState.symptoms.includes(pendingQuestionKey)) {
            session.clinicalState.symptoms.push(pendingQuestionKey);
          }
          if (!session.clinicalState.redFlags.includes(pendingQuestionKey)) {
            session.clinicalState.redFlags.push(pendingQuestionKey);
          }
        }
      }
    }

    // 2. Run Information Extraction on the response to fetch updates
    const extracted = await extractionLayer.extract(message, session.clinicalState);

    // GUARD: If the user explicitly answered negatively to the pending question key (e.g. "No" to confusion),
    // override the LLM output and ensure that specific key is not mistakenly marked as positive.
    if (pendingQuestionKey && !isPositiveAnswer(message)) {
      extracted.symptoms = (extracted.symptoms || []).filter((s) => s !== pendingQuestionKey);
      extracted.redFlags = (extracted.redFlags || []).filter((r) => r !== pendingQuestionKey);
    }

    session.clinicalState = extractionLayer.merge(session.clinicalState, extracted);

    // 3. Emergency Check
    const emergency = emergencyLayer.check(session.clinicalState);
    if (emergency.emergencyDetected) {
      const rec = await dispositionEngine.evaluate(session.clinicalState, true, emergency.emergencyReason);
      session.finalRecommendation = rec;
      session.status = "COMPLETED";

      await sessionService.saveSession(sessionId, session);
      return res.json(shapeTriageResponse(session, null, null, rec));
    }

    // 4. Recalculate Missing Parameters & Priority
    const missing = missingInfoEngine.findMissing(session.clinicalState);
    const prioritized = priorityEngine.prioritize(missing);
    session.clinicalState.missingQuestions = prioritized.map((p) => p.key);

    const questionsAskedCount = session.questionHistory.length;

    // 5. Generate next question if we have missing items and haven't exceeded MAX_QUESTIONS
    if (prioritized.length > 0 && questionsAskedCount < MAX_QUESTIONS) {
      const nextQ = prioritized[0];
      const questionText = await questionGenerator.generateQuestion(nextQ.key, session.clinicalState);

      session.conversationHistory.push({
        role: "assistant",
        content: questionText,
      });

      await sessionService.saveSession(sessionId, session);
      return res.json(shapeTriageResponse(session, questionText, nextQ.key, null));
    } else {
      // Complete triage session
      const rec = await dispositionEngine.evaluate(session.clinicalState, false);
      session.finalRecommendation = rec;
      session.status = "COMPLETED";

      const specialization = await findOrCreateSpecialization(rec.specialist);
      await SymptomSearch.create({
        user: session.user,
        symptomsText: session.conversationHistory
          .filter((h) => h.role === "user")
          .map((h) => h.content)
          .join(" | "),
        inputLanguage: "en",
        recommendedSpecialization: specialization?._id || null,
        recommendedSpecializationName: specialization?.name || rec.specialist || "",
        analysisReason: rec.explanation,
        urgencyLevel: rec.urgencyLevel === "emergency" ? "emergency" : (rec.urgencyLevel === "urgent" ? "high" : "low"),
        warningMessage: rec.warningMessage || "",
        matchedSymptoms: rec.matchedSymptoms || [],
        canShowDoctors: rec.canShowDoctors,
        retrievalQuery: rec.specialist,
        qaHistory: (session.questionHistory || []).map((q) => ({
          question: q.text || "",
          answer: q.answer || "",
          timestamp: q.timestamp || new Date()
        })),
      });

      await sessionService.saveSession(sessionId, session);
      return res.json(shapeTriageResponse(session, null, null, rec));
    }
  } catch (error) {
    console.error("Triage Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process triage response.",
      error: error.message,
    });
  }
};