import express from "express";
import { deleteUser } from "src/controllers/user.delete";

const userRouter = express.Router();
userRouter.route("/").delete(deleteUser);

