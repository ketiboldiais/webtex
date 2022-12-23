import dotenv from "dotenv";
dotenv.config();
import { db } from "../database/db";
import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { BadEmailMessage, SuccessMessage } from "@webtex/types";
import { UserEntry } from "../types";
import { validateAuthPayload } from "@webtex/lib/dist";
import { devlog } from "../dev";

/**
 * @description Register for new account
 * @route POST /auth
 * @access Public
 * @remark No JWT handling here, those are only issued
 * at login, since the user still has to verify their
 * email.
 */

export const register = async (req: Request, res: Response) => {
  devlog("Executing register handler.");

  const { body } = req;

  devlog("Validating register payload.");
  const result = validateAuthPayload(body);

  const { email, password } = result;
  devlog(`Validated register payload: {email:${email}, password:${password}}.`);

  try {
    devlog(`Checking duplicates.`);
    const duplicate = await db
      .selectFrom("users")
      .select("email")
      .where("email", "=", email)
      .executeTakeFirst();

    if (duplicate) {
      devlog(`Duplicate found.`);
      return res.status(400).json(BadEmailMessage);
    }

    devlog(`Hashing password.`);
    const hashedPwd = await bcrypt.hash(password, Number(process.env.SALT));

    const userEntry: UserEntry = {
      email: email,
      password: hashedPwd,
      verified: false,
      joined: new Date(),
    };

    devlog(`Inserting user into database.`);
    const user = await db
      .insertInto("users")
      .values(userEntry)
      .returning(["user", "email", "joined", "verified"])
      .executeTakeFirst();
    if (!user) {
      devlog(`Failed to insert user into database.`);
      return res.status(500);
    }
    devlog(`Successfully inserted user into database.`);
    return res.status(200).json(SuccessMessage);
  } catch (error) {
    return res.sendStatus(500);
  }
};
