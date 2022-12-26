import { Request, Response } from "express";
import { URL } from "url";

const pathToMain = new URL("./public/index.html", import.meta.url).pathname;

export const defaultHandler = (_: Request, res: Response) => {
  res.sendFile(pathToMain);
};
