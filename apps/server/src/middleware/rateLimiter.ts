import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { message: "Too many login attempts." },
  standardHeaders: true,
  legacyHeaders: false,
});
