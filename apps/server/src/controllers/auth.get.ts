/**
 * @description Log in to account
 * @route GET /auth
 * @access Public
 */

import { Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginPayload, LoginRequest, TokenObj, message } from "@webtex/api";
import { db } from "../database/db";
import { accessExpire, refreshExpire } from "./config";

export const login = async (req: LoginRequest, res: Response) => {
  const { email, password } = req.body;
  try {
    // ensure data is actually provided
    if (!email || !password) {
      return res.status(400).json({ message: message.badCredentials });
    }

    // verify that input data are string types
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: message.badCredentials });
    }

    // check if user exists
    const foundUser = await db
      .selectFrom("users")
      .select(["password", "active", "user"])
      .where("email", "=", email)
      .executeTakeFirst();

    // handle case where user doesn't exist
    if (!foundUser) {
      return res.status(401).json({ message: message.badCredentials });
    }

    // handle case where user's account hasn't been verified
    if (!foundUser.active) {
      return res.status(401).json({ message: message.badCredentials });
    }

    // verify password
    const match = await bcrypt.compare(password, foundUser.password);

    // handle case where password doesn't match
    if (!match) {
      return res.status(401).json({ message: message.badCredentials });
    }

    // object for JWT
    const token: TokenObj = { user: foundUser.user };

    // generate the access token
    const accessToken = jwt.sign(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: accessExpire }
    );

    // generate the refresh token
    const refreshToken = jwt.sign(
      token,
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: refreshExpire }
    );

    // store the refresh token in an httpOnly cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 100,
    });

    // return the token
    const loginResponseData: LoginPayload = { accessToken };
    return res.status(200).json(loginResponseData);
  } catch (error) {
    return res.sendStatus(500);
  }
};
