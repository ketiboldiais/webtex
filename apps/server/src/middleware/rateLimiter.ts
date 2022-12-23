import { message } from "@webtex/types";
import rateLimit from "express-rate-limit";
import { reqSpeedLimit } from "src/configs";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: reqSpeedLimit,
  message: { message: message.tooManyLoginAttempts },
  standardHeaders: true,
  legacyHeaders: false,
});
