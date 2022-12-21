/**
 * @description Handles refresh token requests.
 */
// import { Response } from "express";
// import jwt from "jsonwebtoken";
// import { RefreshRequest, TokenObj } from "@webtex/api";
// import { db } from "../database/db";

// export const refresh = (req: RefreshRequest, res: Response) => {
  // const cookies = req.cookies;
  // if (!cookies?.jwt) {
    // return res.sendStatus(401);
  // }
  // const refreshToken = cookies.jwt;
  // res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  // jwt.verify(
    // refreshToken,
    // process.env.REFRESH_TOKEN_SECRET as string,
    // async (err: any, decoded: TokenObj) => {
      // try {
        // if (err) {
          // return res.sendStatus(403);
        // }
        // const user = decoded.user;
        // const foundUser = await db
          // .selectFrom("users")
          // .select(["email", "user"])
          // .where("user", "=", user)
          // .executeTakeFirst();
        // if (!foundUser) {
          // return res.sendStatus(400);
        // }
        // const token: TokenObj = { user: foundUser.user };
        // const accessToken = jwt.sign(
          // token,
          // process.env.ACCESS_TOKEN_SECRET as string,
          // { expiresIn: process.env.JWT_ACCESS_EXPIRE }
        // );
        // return res.status(200).json({ accessToken });
      // } catch (error) {
        // return res.sendStatus(500);
      // }
    // }
  // );
// };
export const foo = 0;