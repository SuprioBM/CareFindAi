export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const reasons =
        result.error.issues?.map((issue) => issue.message).filter(Boolean) ||
        ["Validation error"];

      return res.status(400).json({
        triage_level: "LOW",
        confidence: 0,
        domains: {},
        reasons,
        next_step: "Correct request payload and retry",
        specialties: ["General Physician"]
      });
    }

    req.body = result.data; // sanitized + validated
    next();
  };
};