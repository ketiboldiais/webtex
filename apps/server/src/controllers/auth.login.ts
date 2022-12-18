/**
 * @description Log in to account
 * @route GET /auth
 * @access Public
 */

import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginRequest, TokenObj } from "../server";
import { db } from "../database/db";
import { accessExpire, refreshExpire } from "./config";

export const login = async (req: LoginRequest, res: Response) => {
  const { email, password } = req.body;
  if (
    !email ||
    !password ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Missing email or password." });
  }
  const foundUser = await db
    .selectFrom("users")
    .select(["password", "active", "user"])
    .where("email", "=", email)
    .executeTakeFirst();
  if (!foundUser) {
    return res.status(401).json({ message: "Wrong username or password." });
  }
  if (!foundUser.active) {
    return res.status(401).json({ message: "Account not verified." });
  }
  const match = await bcrypt.compare(password, foundUser.password);
  if (!match) {
    return res.status(401).json({ message: "Wrong username or password." });
  }
  const token: TokenObj = { user: foundUser.user };
  const accessToken = jwt.sign(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: accessExpire }
  );
  const refreshToken = jwt.sign(
    token,
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: refreshExpire }
  );
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 100,
  });
  res.status(200);
  res.json({ accessToken });
};
