// server/middleware/validate.js
export function validate(schema) {
  return (req, res, next) => {
    
    const result = schema.safeParse(req.body);
    

    if (!result.success) {
      const errors = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Replace body with cleaned/trimmed values
    req.body = result.data;
    next();
  };
}
