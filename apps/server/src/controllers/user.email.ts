/**
 * @description Change email
 * @route PATCH /user/email
 * @access Private
 */

import { Request, Response } from "express";

import bcrypt from "bcrypt";

import { db } from "../database/db";

export interface EmailUpdateRequest extends Request {
  body: {
    id: string;
    currentEmail: string;
    newEmail: string;
    password: string;
    confirmPassword: string;
  };
}

export const updateEmail = async (req: EmailUpdateRequest, res: Response) => {
  const { id, currentEmail, newEmail, password, confirmPassword } = req.body;
  if (
    !id ||
    !currentEmail ||
    !newEmail ||
    !password ||
    !confirmPassword ||
    typeof currentEmail !== "string" ||
    typeof id !== "string" ||
    typeof newEmail !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    password !== confirmPassword
  ) {
    res.sendStatus(400);
  }

  const foundUser = await db
    .selectFrom("users")
    .select(["password"])
    .where("id", "=", id)
    .orWhere("email", "=", newEmail)
    .execute();

  if (foundUser.length !== 1) {
    return res.status(409).json({ message: "Email unavailable." });
  }

  if (!foundUser) {
    return res.status(400).json({ message: "Wrong email or password." });
  }

  const validPW = await bcrypt.compare(password, foundUser[0].password);

  if (!validPW) {
    return res.status(400).json({ message: "Wrong email or password." });
  }

  const result = await db
    .updateTable("users")
    .set({ email: newEmail })
    .where("id", "=", id)
    .executeTakeFirst();

  if (result) {
    return res
      .status(200)
      .json({ message: "Email changed, verify link sent." });
  }
};
