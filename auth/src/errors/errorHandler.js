// Central error handler. Controllers throw / forward errors here (via
// asyncHandler) instead of each repeating the same try/catch.
// Must be registered LAST in app.js, after the routes and notFound handler.
export const errorHandler = (err, req, res, next) => {
  // Mongo duplicate key (unique index race on username/email).
  if (err.code === 11000) {
    return res
      .status(409)
      .json({ message: "Username or email already exists" });
  }

  // Mongoose schema validation.
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ message });
  }

  // JWT verification failures that reach this far.
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Zod validation errors (in case one bubbles up outside the validate middleware).
  if (err.name === "ZodError") {
    const message = err.issues.map((i) => i.message).join(", ");
    return res.status(400).json({ message });
  }

  // Errors thrown by services with an explicit HTTP status (e.g. httpError()).
  const status = err.status ?? err.statusCode;
  if (status && status >= 400 && status < 500) {
    return res.status(status).json({ message: err.message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error" });
};
