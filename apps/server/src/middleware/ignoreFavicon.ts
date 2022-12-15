import { Request, Response, NextFunction } from "express";

export const ignoreFavicon = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.originalUrl && req.originalUrl.split("/").pop() === "favicon.ico") {
    return res.sendStatus(204);
  }
  next();
};
