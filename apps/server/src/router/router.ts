import express from "express";

import { register } from "../endpoints/post.auth.js";
import { login } from "../endpoints/post.user.js";
import { logout } from "../endpoints/delete.session.js";
import { defaultHandler } from "../endpoints/get.root.js";
import { refresh } from "../endpoints/patch.session.js";
import { verifyUser } from "../endpoints/get.confirmation.js";
import { loginLimiter, otpLimiter } from "src/middleware/rateLimiter.js";
import { auth_api_route, login_api_route, logout_api_route, refresh_api_route } from '@webtex/shared';

const Router = express.Router();
Router.route('/').get(defaultHandler);
Router.route(auth_api_route).post(register);
Router.route(`/confirmation/:token`).get(otpLimiter, verifyUser);
Router.route(login_api_route).post(loginLimiter, login);
Router.route(logout_api_route).post(logout);
Router.route(refresh_api_route).post(refresh);

export { Router };
