/**
 * @description Change password
 * @route PATCH /user/password
 * @access Private
 */

import { Request, Response } from "express";

import bcrypt from "bcrypt";

import { User, UserEntry, db } from "../database/db";

export interface PasswordUpdateRequest extends Request {
  body: {
    id: string;
    password: string;
    newPassword: string;
    confirmNewPassword: string;
  };
}

export const updatePassword = async (
  req: PasswordUpdateRequest,
  res: Response
) => {
  const { id, password, newPassword, confirmNewPassword } = req.body;
  if (
    !id ||
    !password ||
    !newPassword ||
    !confirmNewPassword ||
    typeof id !== "string" ||
    typeof password !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmNewPassword !== "string" ||
    newPassword !== confirmNewPassword
  ) {
    res.sendStatus(400);
  }

  const foundUser = await db
    .selectFrom("users")
    .select(["password"])
    .where("id", "=", id)
    .execute();

  if (!foundUser) {
    return res.status(400).json({ message: "Wrong email or password." });
  }

  const validPW = await bcrypt.compare(password, foundUser[0].password);

  if (!validPW) {
    return res.status(400).json({ message: "Wrong email or password." });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  const result = await db
    .updateTable("users")
    .set({ password: hash })
    .where("id", "=", id)
    .executeTakeFirst();

  if (result) {
    return res.status(200).json({ message: "Password updated." });
  }
};
