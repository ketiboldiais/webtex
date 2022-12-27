import rateLimit from "express-rate-limit";
import Env from "../configs/index.js";

export const loginLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: Env.reqSpeedLimit,
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});
