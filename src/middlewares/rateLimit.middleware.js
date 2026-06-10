import rateLimit from "express-rate-limit";

// Disabled in tests (which register/login many users in quick succession from
// the same IP) and tunable via env for production deployments.
const skipRateLimit = () => process.env.DISABLE_RATE_LIMIT === "true";

const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    statusCode: 429,
    message: "Too many requests, please try again later",
    errors: [],
  });
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  handler: rateLimitHandler,
});
