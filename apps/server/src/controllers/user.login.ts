/**
 * @description Log in to account
 * @route POST /user
 * @access Public
 */

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TokenObj } from "../types";
import { message } from "@webtex/types";
import { db } from "../database/db";
import { validateAuthPayload } from "@webtex/lib";
import { devlog } from "src/dev";

export const login = async (req: Request, res: Response) => {
  devlog(`Validating payload.`);
  const payload = validateAuthPayload(req.body);
  devlog(`Successfully validated payload.`);
  if (payload === message.failure) {
    devlog(`Returning 400. Bad payload.`);
    return res.status(400).json({ message: message.badCredentials });
  }
  try {
    const { email, password } = payload;

    devlog(`Querying database for user.`);

    const foundUser = await db
      .selectFrom("users")
      .select(["password", "verified", "user"])
      .where("email", "=", email)
      .executeTakeFirst();

    if (!foundUser) {
      devlog(`Returning 400. No user found.`);
      return res.status(400).json({ message: message.badCredentials });
    }

    if (!foundUser.verified) {
      devlog(`Returning 400. User not verified.`);
      return res.status(400).json({ message: message.badCredentials });
    }

    devlog(`Verifying password.`);
    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      devlog(`Returning 401. No match password.`);
      return res.status(401).json({ message: message.badCredentials });
    }

    // const token: TokenObj = { user: foundUser.user };

    // devlog(`Creating access token.`);
    // const accessToken = jwt.sign(
      // token,
      // process.env.ACCESS_TOKEN_SECRET as string,
      // { expiresIn: process.env.JWT_ACCESS_EXPIRE }
    // );

    // devlog(`Creating refresh token.`);
    // const refreshToken = jwt.sign(
      // token,
      // process.env.REFRESH_TOKEN_SECRET as string,
      // { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    // );

    // devlog(`Storing refresh token in cookie.`);
    // res.cookie("jwt", refreshToken, {
      // httpOnly: true,
      // secure: true,
      // sameSite: "none",
      // maxAge: 7 * 24 * 60 * 60 * 100,
    // });

    // devlog(`Attaching JWT accessToken: ${accessToken}`);
    // res.json({ accessToken });
    req.session.user = foundUser.user;
    devlog(`Stored session data: ${req.session}`);
    return res.status(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};
