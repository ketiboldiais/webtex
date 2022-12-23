import { getDate } from "@webtex/string";
import { Request, Response } from "express";
import { makeToken } from "src/middleware/token";
import { TokenObj } from "src/types";

export const checkin = (req: Request, res: Response) => {
  const user = req.session.user;
  if (user) {
    const payload: TokenObj = { user };
    const accessToken = makeToken.access(payload);
    const refreshToken = makeToken.refresh(payload);
    return res.status(200).json();
  } else {
    return res.status(400);
  }
};
