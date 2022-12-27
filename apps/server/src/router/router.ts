import express from "express";

import { AUTH, SESSION, USER, ROOT, VERIFY } from "@webtex/shared";
import { register } from "../endpoints/post.auth.js";
import { login } from "../endpoints/post.user.js";
import { logout } from "../endpoints/delete.session.js";
import { defaultHandler } from "../endpoints/get.root.js";
import { refresh } from "../endpoints/patch.session.js";
import { verifyUser } from "../endpoints/get.confirmation.js";
import { loginLimiter, otpLimiter } from "src/middleware/rateLimiter.js";

const Router = express.Router();
Router.route(ROOT).get(defaultHandler);
Router.route(AUTH).post(register);
Router.route(`${VERIFY}:token`).get(otpLimiter, verifyUser);
Router.route(USER).post(loginLimiter, login);
Router.route(SESSION).delete(logout);
Router.route(SESSION).patch(refresh);

export { Router };
