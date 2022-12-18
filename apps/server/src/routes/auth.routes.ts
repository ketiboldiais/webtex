import express from "express";

import { login } from "src/controllers/auth.login";
import { logout } from "src/controllers/auth.logout";
import { refresh } from "src/controllers/auth.refresh";
import { rateLimiter } from "src/middleware/rateLimiter";

const router = express.Router();
router.route("/").post(rateLimiter, login);
router.route("/refresh").get(refresh);
router.route("/logout").post(logout);

export default router;
