import { Request, Response } from "express";

export const errorHandler = (req: Request, res: Response) => {
  const status = res.statusCode ? res.statusCode : 500;
  res.status(status);
};
