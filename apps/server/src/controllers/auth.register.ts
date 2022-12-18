/**
 * @description Register for new account
 * @route POST /user
 * @access Public
 */

import { db } from "../database/db";

import { Response } from "express";
import bcrypt from "bcrypt";
import { RegisterRequest, UserEntry } from "@webtex/api";

export const register = async (req: RegisterRequest, res: Response) => {
  const { email, password } = req.body;
  try {
    // confirm data is provided
    if (!email || !password) {
      return res.sendStatus(400);
    }
    // confirm data is actually a string type
    if (typeof email !== "string" || typeof password !== "string") {
      return res.sendStatus(400);
    }
    // check for duplicates
    const duplicate = await db
      .selectFrom("users")
      .select("email")
      .where("email", "=", email)
      .executeTakeFirst();
      
    if (duplicate) {
      return res.sendStatus(400);
    }

    const hashedPwd = await bcrypt.hash(password, Number(process.env.SALT));
    
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
      
    // TODO: implement email verification link
      
    if (newUser.email) {
      return res.status(200);
    }
    return res.status(400).json({ message: `Failed to register.` });
  } catch (error) {
    return res.sendStatus(500);
  }
};
