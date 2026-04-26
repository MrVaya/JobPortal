import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many login attempts. Please try again after 1 minute. Rate Limit: 5 attempts",
  },
});