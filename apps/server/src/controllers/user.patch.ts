import {
  BadCredentialsMessage,
  MissingDataMessage,
  PasswordUpdateRequest,
  SuccessMessage,
} from "@webtex/api";
import { Response } from "express";
import { db } from "src/database/db";
import bcrypt, { hash } from "bcrypt";
/**
 * @summary Updates the user's password.
 * @route PATCH `/user`
 * @access private
 * @description
 * This function will update the user's password.
 * HTTP PATCH is used because they're changing their
 * password. I.e., there isn't a new user, they're
 * just updating their password.
 */

export const updatePassword = async (
  req: PasswordUpdateRequest,
  res: Response
) => {
  const { user, email, password, newPassword } = req.body;
  if (!user || !email || !password || !newPassword) {
    return res.status(400).json(MissingDataMessage);
  }
  // non-string data types implies missing data
  if (
    typeof user !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof newPassword !== "string"
  ) {
    return res.status(400).json(MissingDataMessage);
  }
  try {
    // find the alleged user
    const foundUser = await db
      .selectFrom("users")
      .select(["user", "email", "password"])
      .where("user", "=", user)
      .executeTakeFirst();

    // handle user not found
    if (!foundUser) {
      return res.status(400).json(MissingDataMessage);
    }

    // verify password
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      return res.status(400).json(BadCredentialsMessage);
    }

    // hash new password
    const hashedPwd = await bcrypt.hash(password, Number(process.env.SALT));
    const passwordUpdated = await db
      .updateTable("users")
      .set({ password: hashedPwd })
      .where("user", "=", foundUser.user)
      .executeTakeFirst();

    if (!passwordUpdated) {
      return res.sendStatus(500);
    }

    return res.status(200).json(SuccessMessage);
  } catch (error) {
    return res.sendStatus(500);
  }
};
