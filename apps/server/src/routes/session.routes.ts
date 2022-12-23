import express from "express";
import { logout } from "src/controllers/session.logout";
import { sessionCheck } from "src/controllers/session.validate";

const sessionRouter = express.Router();
// TODO POST base/session - get refresh token

// GET base/session - check if user is logged in
sessionRouter.route("/").get(sessionCheck);

// DELETE base/session - logout user
sessionRouter.route("/").delete(logout);

export { sessionRouter };
