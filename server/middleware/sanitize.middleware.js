/**
 * BASIC INPUT SANITIZATION LAYER
 */
export const sanitizeInput = (req, res, next) => {
  const sanitizeText = (value) =>
    String(value)
      .replace(/<[^>]*>?/gm, "")
      .trim();

  if (req.body?.message) {
    req.body.message = sanitizeText(req.body.message);
  }

  if (req.body?.text) {
    req.body.text = sanitizeText(req.body.text);
  }

  if (req.body?.sessionId) {
    req.body.sessionId = sanitizeText(req.body.sessionId);
  }

  if (req.body?.gender) {
    req.body.gender = sanitizeText(req.body.gender);
  }

  if (req.body?.duration) {
    req.body.duration = sanitizeText(req.body.duration);
  }

  if (req.body?.severity) {
    req.body.severity = sanitizeText(req.body.severity);
  }

  if (typeof req.body?.existingConditions === "string") {
    req.body.existingConditions = sanitizeText(req.body.existingConditions);
  }

  if (Array.isArray(req.body?.existingConditions)) {
    req.body.existingConditions = req.body.existingConditions.map((item) => sanitizeText(item));
  }

  next();
};