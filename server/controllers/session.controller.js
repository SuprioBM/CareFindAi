import { SessionService } from "../services/session.service.js";

const sessionService = new SessionService();

/**
 * GET SESSION
 */
export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const data = await sessionService.getSession(sessionId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    return res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error("Session fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * DELETE SESSION
 */
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    await sessionService.deleteSession(sessionId);

    return res.json({
      success: true,
      message: "Session cleared"
    });
  } catch (err) {
    console.error("Session delete error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/**
 * RESET SESSION
 */
export const resetSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const freshSession = sessionService.createNewSession();

    await sessionService.saveSession(sessionId, freshSession);
    await sessionService.refreshSession(sessionId);

    return res.json({
      success: true,
      message: "Session reset",
      data: freshSession
    });
  } catch (err) {
    console.error("Session reset error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};