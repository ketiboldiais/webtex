/**
 * @description Register for new account
 * @route POST /auth
 * @access Public
 */

import { db } from "../database/db";

import { Response } from "express";
import bcrypt from "bcrypt";
import {
  BadEmailMessage,
  MissingDataMessage,
  RegisterFailMessage,
  RegisterRequest,
  SuccessMessage,
  UserEntry,
} from "@webtex/api";

export const register = async (req: RegisterRequest, res: Response) => {
  const { email, password } = req.body;
  // confirm data is provided
  if (!email || !password) {
    return res.status(400).json(MissingDataMessage);
  }
  // confirm data is actually a string type
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json(MissingDataMessage);
  }
  try {
    // check for duplicates
    const duplicate = await db
      .selectFrom("users")
      .select("email")
      .where("email", "=", email)
      .executeTakeFirst();

    if (duplicate) {
      return res.status(400).json(BadEmailMessage);
    }

    const hashedPwd = await bcrypt.hash(password, Number(process.env.SALT));

    const userEntry: UserEntry = {
      email: email,
      password: hashedPwd,
      active: false,
      joined: new Date(),
    };

    // Store new user
    const user = await db
      .insertInto("users")
      .values(userEntry)
      .executeTakeFirst();
    if (!user) {
      return res.sendStatus(400);
    }
    return res.status(200).json(SuccessMessage);
  } catch (error) {
    return res.sendStatus(500);
  }
};
