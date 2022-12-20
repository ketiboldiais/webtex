/**
 * @description Log out of account
 * @route DELETE /auth
 * @access Private
 */

import {MissingDataMessage} from "@webtex/api";
import { Request, Response } from "express";

export const logout = (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(204).json(MissingDataMessage);
  }
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  return res.status(200);
};
