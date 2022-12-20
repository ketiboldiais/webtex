import {
  BadCredentialsMessage,
  BadEmailMessage,
  EmailUpdateRequest,
  MissingDataMessage,
  VerifyMessage,
} from "@webtex/api";
import { Response } from "express";
import { db } from "src/database/db";
import bcrypt from "bcrypt";

/**
 * @summary Updates the user's email.
 * @route PUT `/user`
 * @access private
 * @description
 * This function will update the user's email.
 * HTTP PUT is used because emails are the
 * primary key of identifying users. If a user
 * changes their email, they're effectively
 * becoming new users because a user is just an
 * email.
 */

export const updateEmail = async (req: EmailUpdateRequest, res: Response) => {
  const { user, currentEmail, newEmail, password } = req.body;
  // handle missing data
  if (!user || !currentEmail || !newEmail || !password) {
    return res.status(400).json(MissingDataMessage);
  }
  // non-string data types implies missing data
  if (
    typeof user !== "string" ||
    typeof currentEmail !== "string" ||
    typeof newEmail !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json(MissingDataMessage);
  }
  try {
    // ensure user actually exists
    // we select
    const user = await db
      .selectFrom("users")
      .select(["user", "password"])
      .where("email", "=", currentEmail)
      .orWhere("email", "=", newEmail)
      .execute();

    if (user.length > 1) {
      return res.status(400).json(BadEmailMessage);
    }
    // verify password
    const match = await bcrypt.compare(password, user[0].password);

    if (!match) {
      return res.status(400).json(BadCredentialsMessage);
    }

    // update email
    const emailUpdated = await db
      .updateTable("users")
      .set({ email: newEmail, active: false })
      .where("user", "=", user[0].user)
      .executeTakeFirst();

    if (!emailUpdated) {
      res.sendStatus(500);
    }
    // TODO - Implement verify link for email update
    return res.status(200).json(VerifyMessage);
  } catch (error) {
    return res.sendStatus(500);
  }
};
