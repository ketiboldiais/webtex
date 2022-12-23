import { Request, Response } from "express";

export const sessionCheck = (req: Request, res: Response) => {
  const user = req.session.user;
  if (user) {
    return res.status(200);
  } else {
    return res.status(400);
  }
};
