/**
 * @description Log in to account
 * @route GET /auth
 * @access Public
 */

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { TokenObj } from "../types";
import { message, MissingDataMessage } from "@webtex/types";
import { db } from "../database/db";
import { authInputSchema } from "src/validators/authInputSchema";

export const login = async (req: Request, res: Response) => {
  const { body } = req;
  try {
    authInputSchema.validateSync(body, { abortEarly: false });
  } catch (error) {
    return res.status(400).json(MissingDataMessage);
  }
  try {
    const { email, password } = req.body;
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
      .select(["password", "verified", "user"])
      .where("email", "=", email)
      .executeTakeFirst();

    // handle case where user doesn't exist
    if (!foundUser) {
      return res.status(400).json({ message: message.badCredentials });
    }

    // handle case where user's account hasn't been verified
    if (!foundUser.verified) {
      return res.status(400).json({ message: message.badCredentials });
    }

    // verify password
    const match = await bcrypt.compare(password, foundUser.password);

    // handle case where password doesn't match
    if (!match) {
      return res.status(401).json({ message: message.badCredentials });
    }

    // Token object encoded as JWT
    const token: TokenObj = { user: foundUser.user };
    // Generate new access token
    const accessToken = jwt.sign(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: process.env.JWT_ACCESS_EXPIRE }
    );

    // generate the refresh token
    // NOTE - This 1 corresponds to JWT_REFRESH_EXPIRE
    const refreshToken = jwt.sign(
      token,
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE }
    );

    // store the refresh token in an httpOnly cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 100,
    });

    // await redisClient.set(
    // foundUser.user,
    // JSON.stringify({
    // refreshToken: refreshToken,
    // expires: refreshTokenMaxAge,
    // })
    // );
    // return the token
    // const loginResponseData: LoginPayload = { accessToken };
    // set session
    // return res.status(200).json(loginResponseData);
    req.session.user = foundUser.user;
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};
