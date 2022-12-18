/**
 * @description Log out of account
 * @route DELETE /auth
 * @access Private
 */

import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(204);
  }
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  res.status(200).json({ message: "Cookie cleared" });
};
