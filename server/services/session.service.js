import { getRedis } from "../config/redis.js";

/**
 * SESSION SERVICE (Single responsibility: triage session persistence)
 * - Handles Redis read/write/delete
 * - TTL management
 * - Safe key normalization
 */

const SESSION_PREFIX = "triage:session:";
const SESSION_TTL_SECONDS = 60 * 30; // 30 minutes

export class SessionService {
  get redis() {
    return getRedis();
  }

  /**
   * Normalize session ID (prevents double prefix bugs)
   */
  normalizeSessionId(sessionId) {
    if (!sessionId) return sessionId;
    return sessionId.replace(SESSION_PREFIX, "");
  }

  /**
   * Build Redis key safely
   */
  buildKey(sessionId) {
    const cleanId = this.normalizeSessionId(sessionId);
    return `${SESSION_PREFIX}${cleanId}`;
  }

  /**
   * Get session from Redis
   */
  async getSession(sessionId) {
    const key = this.buildKey(sessionId);

    const data = await this.redis.get(key);

    if (!data) return null;

    return JSON.parse(data);
  }

  /**
   * Create new session structure
   */
  createNewSession() {
    return {
      state: {
        detectedSymptoms: [],
        collectedParameters: {},
        rawParameters: {},
        domains: {},
        domainInsights: {},
        selectedDomains: [],

        // ✅ FIX: must be array
        missingParameters: [],

        redFlagsTriggered: [],
        currentDomain: null,
        nextQuestion: null,
        askedParameters: {},
        shouldStop: false,
        stage: "initial"
      },
      history: []
    };
  }

  /**
   * Reset session while preserving sessionId key
   */
  async resetSession(sessionId) {
    const freshSession = this.createNewSession();
    await this.saveSession(sessionId, freshSession);
    return freshSession;
  }

  /**
   * Save session with TTL
   */
  async saveSession(sessionId, sessionData) {
    const key = this.buildKey(sessionId);

    await this.redis.set(key, JSON.stringify(sessionData), {
      EX: SESSION_TTL_SECONDS
    });
  }

  /**
   * Extend session TTL
   */
  async refreshSession(sessionId) {
    const key = this.buildKey(sessionId);

    await this.redis.expire(key, SESSION_TTL_SECONDS);
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    const key = this.buildKey(sessionId);

    await this.redis.del(key);
  }
}