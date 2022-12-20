import express from "express";
import { deleteUser } from "src/controllers/user.delete";
import { updatePassword } from "src/controllers/user.patch";
import { updateEmail } from "src/controllers/user.put";

const userRouter = express.Router();
userRouter.route("/").delete(deleteUser);
userRouter.route("/").put(updateEmail);
userRouter.route("/").patch(updatePassword);

export { userRouter };
