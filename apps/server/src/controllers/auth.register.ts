import dotenv from "dotenv";
dotenv.config();
import { db } from "../database/db";
import { Response, Request } from "express";
import bcrypt from "bcrypt";
import {
  BadEmailMessage,
  MissingDataMessage,
  SuccessMessage,
} from "@webtex/types";
import { UserEntry } from "../types";
import { verifyRegisterSubmission } from "@webtex/lib/dist";

/**
 * @description Register for new account
 * @route POST /auth
 * @access Public
 * @remark No JWT handling here, those are only issued
 * at login, since the user still has to verify their
 * email.
 */

export const register = async (req: Request, res: Response) => {
  const { body } = req;
  try {
    const data = verifyRegisterSubmission.validateSync(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const { email, password } = data;
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
        verified: false,
        joined: new Date(),
      };

      // Store new user
      const user = await db
        .insertInto("users")
        .values(userEntry)
        .returning("user")
        .executeTakeFirst();
      if (!user) {
        return res.sendStatus(400);
      }
      return res.status(200).json(SuccessMessage);
    } catch (error) {
      return res.sendStatus(500);
    }
  } catch (error) {
    return res.status(400).json(MissingDataMessage);
  }
};
