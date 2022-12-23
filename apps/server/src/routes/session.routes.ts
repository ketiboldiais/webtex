import express from "express";
import { logout } from "src/controllers/session.logout";
import { checkin } from "src/controllers/session.checkin";

const sessionRouter = express.Router();
// TODO POST base/session - get refresh token

// GET base/session - check if user is logged in
sessionRouter.route("/").get(checkin);

// DELETE base/session - logout user
sessionRouter.route("/").delete(logout);

export { sessionRouter };
