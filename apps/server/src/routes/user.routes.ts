import express from "express";
import { deleteUser } from "src/controllers/user.deleteAccount";
import { updatePassword } from "src/controllers/user.updatePassword";
import { updateEmail } from "src/controllers/user.updateEmail";

const userRouter = express.Router();
userRouter.route("/").delete(deleteUser);
userRouter.route("/").put(updateEmail);
userRouter.route("/").patch(updatePassword);

export { userRouter };
