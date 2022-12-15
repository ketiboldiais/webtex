import { NextFunction, Request, Response } from "express";
import { logEvents } from "./logger";

export const errorHandler = (req: Request, res: Response) => {
  logEvents(
    `ERROR\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  const status = res.statusCode ? res.statusCode : 500;
  res.status(status);
};
