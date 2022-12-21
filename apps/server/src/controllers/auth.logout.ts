/**
 * @description Log out of account
 * @route DELETE /auth
 * @access Private
 */

import { MissingDataMessage } from "@webtex/types";
import { redisClient } from "src/database/redisClient";
import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
  const { user } = req.body;
  await redisClient.del(user);
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(204).json(MissingDataMessage);
  }
  res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
  return res.status(200);
};
