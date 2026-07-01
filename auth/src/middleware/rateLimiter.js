import { rateLimit, ipKeyGenerator } from "express-rate-limit";

export const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
  // Count per logged-in user; fall back to a normalized IP key (IPv6-safe).
  keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip),
});
