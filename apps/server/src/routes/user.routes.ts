import express from "express";
import { deleteUser } from "src/controllers/user.deleteAccount";
import { updatePassword } from "src/controllers/user.updatePassword";
import { updateEmail } from "src/controllers/user.updateEmail";
import { login } from "src/controllers/user.login";
import { rateLimiter } from "src/middleware/rateLimiter";

const userRouter = express.Router();
userRouter.route("/").post(rateLimiter, login);
export { userRouter };
