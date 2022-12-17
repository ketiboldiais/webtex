/**
 * @description Register for new account
 * @route POST /user
 * @access Public
 */

import { db } from "../database/db";

import { Response } from "express";
import bcrypt from "bcrypt";
import { RegisterRequest, UserEntry } from "src/server";

export const register = async (req: RegisterRequest, res: Response) => {
  const { email, password } = req.body;
  // confirm data is provided
  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.sendStatus(400);
  }
  const duplicate = await db
    .selectFrom("users")
    .select("email")
    .where("email", "=", email)
    .executeTakeFirst();

  if (duplicate) {
    return res.sendStatus(400);
  }

  const hashedPwd = await bcrypt.hash(password, 10);
  const userEntry: UserEntry = {
    email: email,
    password: hashedPwd,
    active: false,
    joined: new Date(),
  };

  // Store new user
  const newUser = await db
    .insertInto("users")
    .values(userEntry)
    .returning("email")
    .executeTakeFirst();

  if (newUser.email) {
    return res
      .status(200)
      .json({ message: `New user ${newUser.email} registered.` });
  } else {
    return res.status(400).json({ message: `Failed to register.` });
  }
};
