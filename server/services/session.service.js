import SymptomSession from "../models/session.model.js";

/**
 * SESSION SERVICE (Persists triage sessions in MongoDB)
 */
export class SessionService {
  /**
   * Get session from MongoDB
   */
  async getSession(sessionId) {
    if (!sessionId) return null;
    return await SymptomSession.findOne({ sessionId });
  }

  /**
   * Create new session structure
   */
  createNewSession(userId, sessionId) {
    return new SymptomSession({
      user: userId,
      sessionId: sessionId,
      status: "ACTIVE",
      conversationHistory: [],
      clinicalState: {
        sessionId: sessionId,
        demographics: {
          age: null,
          gender: null,
        },
        symptoms: [],
        symptomTimeline: {},
        severity: {},
        riskFactors: [],
        medications: [],
        medicalHistory: [],
        redFlags: [],
        answeredQuestions: [],
        missingQuestions: [],
        urgencyLevel: null,
        recommendedSpecialty: null,
        confidenceScore: null,
      },
      questionHistory: [],
      finalRecommendation: null,
    });
  }

  /**
   * Reset session while preserving sessionId key
   */
  async resetSession(sessionId, userId) {
    await this.deleteSession(sessionId);
    const freshSession = this.createNewSession(userId, sessionId);
    await this.saveSession(sessionId, freshSession);
    return freshSession;
  }

  /**
   * Save session to MongoDB
   */
  async saveSession(sessionId, sessionData) {
    if (sessionData && typeof sessionData.save === "function") {
      await sessionData.save();
    } else {
      await SymptomSession.findOneAndUpdate(
        { sessionId },
        { $set: sessionData },
        { upsert: true, new: true }
      );
    }
  }

  /**
   * Refresh session (no-op since MongoDB documents don't require manual expire refresh)
   */
  async refreshSession(sessionId) {
    // No-op for Mongoose storage
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    if (!sessionId) return;
    await SymptomSession.deleteOne({ sessionId });
  }
}