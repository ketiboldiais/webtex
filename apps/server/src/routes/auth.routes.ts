import express from "express";

import { login } from "src/controllers/auth.get";
import { logout } from "src/controllers/auth.delete";
import { refresh } from "src/controllers/auth.patch";
import { register } from "src/controllers/auth.post";
import { rateLimiter } from "src/middleware/rateLimiter";

const authRouter = express.Router();
authRouter.route("/").post(rateLimiter, register);
authRouter.route("/").get(rateLimiter, login);
authRouter.route("/").patch(rateLimiter, refresh);
authRouter.route("/").delete(rateLimiter, logout);

export { authRouter };
