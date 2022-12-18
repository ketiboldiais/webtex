/**
 * @description Handles refresh token requests.
 */
import { Response } from "express";
import jwt from "jsonwebtoken";
import { RefreshRequest, TokenObj } from "@webtex/api";
import { db } from "../database/db";
import { accessExpire } from "./config";

export const refresh = (req: RefreshRequest, res: Response) => {
  const cookies = req.cookies;
  const { user, email } = req.body;
  if (!cookies?.jwt) {
    return res.status(400).json({ message: "Unauthorized" });
  }
  const refreshToken = cookies.jwt;
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string,
    async (err: any) => {
      try {
        if (err) {
          return res.status(400).json({ message: "Unauthorized" });
        }
        const foundUser = await db
          .selectFrom("users")
          .select(["email", "user"])
          .where("user", "=", user)
          .executeTakeFirst();
        if (!foundUser) {
          return res.status(400).json({ message: "Unauthorized" });
        }
        if (foundUser.email !== email) {
          return res.status(400).json({ message: "Unauthorized" });
        }
        const token: TokenObj = { user: foundUser.user };
        const accessToken = jwt.sign(
          token,
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: accessExpire }
        );
        res.status(200);
        res.json({ accessToken });
      } catch (error) {}
    }
  );
};
