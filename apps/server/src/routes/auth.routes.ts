import express from "express";

import { login } from "src/controllers/user.login";
import { logout } from "src/controllers/session.logout";
// import { refresh } from "src/controllers/auth.patch";
import { register } from "src/controllers/auth.register";
import { rateLimiter } from "src/middleware/rateLimiter";

const authRouter = express.Router();

// Register
authRouter.route("/").post(rateLimiter, register);

// Login
authRouter.route("/").get(rateLimiter, login);

// Refresh
// authRouter.route("/").patch(rateLimiter, refresh);

// Logout
authRouter.route("/").delete(rateLimiter, logout);

export { authRouter };
