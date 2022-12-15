import express from "express";
import { deauthorize } from "../controllers/user.deauthorize";
import { register } from "../controllers/user.register";
import { updateEmail } from "../controllers/user.email";
import { updatePassword } from "../controllers/user.password";

const userRoutes = express.Router();

// POST /user
userRoutes.route("/").post(register);

// DELETE /user
userRoutes.route("/").delete(deauthorize);

// PATCH /user/email
userRoutes.route("/email").patch(updateEmail);

// PATCH /user/password
userRoutes.route("/password").patch(updatePassword);

export default userRoutes;
