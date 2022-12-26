import rateLimit from "express-rate-limit";
import Env from "../configs/index.js";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: Env.reqSpeedLimit,
  standardHeaders: true,
  legacyHeaders: false,
});
