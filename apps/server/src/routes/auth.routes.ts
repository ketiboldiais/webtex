import express from "express";

import { login } from "src/controllers/auth.login";
import { logout } from "src/controllers/auth.logout";
import { refresh } from "src/controllers/auth.refresh";
import { register } from "src/controllers/auth.register";
import { rateLimiter } from "src/middleware/rateLimiter";

const authRouter = express.Router();
authRouter.route("/").post(rateLimiter, register);
authRouter.route("/").get(rateLimiter, login);
authRouter.route("/").patch(rateLimiter, refresh);
authRouter.route("/").delete(rateLimiter, logout);

export { authRouter };
