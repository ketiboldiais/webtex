/**
 * @description Delete existing account
 * @route DELETE /user
 * @access Private
 */

import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { db } from "../database/db";

export interface DeauthorizeRequest extends Request {
  body: {
    id: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
}

export const deauthorize = async (req: Request, res: Response) => {
  const { id, email, password, confirmPassword } = req.body;
  if (
    !id ||
    !email ||
    !password ||
    !confirmPassword ||
    typeof id !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    password !== confirmPassword
  ) {
    res.sendStatus(400);
  }

  const foundUser = await db
    .selectFrom("users")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!foundUser || foundUser.id !== id || foundUser.email !== email) {
    return res.sendStatus(400);
  }

  const validPW = await bcrypt.compare(password, foundUser.password);

  if (!validPW) {
    return res.status(400).json({ message: "Wrong email or password." });
  }

  const deletedUser = await db
    .deleteFrom("users")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirst();

  if (deletedUser.id) {
    await db.deleteFrom("notes").where("id", "=", deletedUser.id).execute();
    return res.status(200).json({ message: "Account deleted." });
  }
};
