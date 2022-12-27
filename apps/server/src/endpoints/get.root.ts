import { Request, Response } from "express";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const defaultHandler = (req: Request, res: Response) => {
  return res.sendFile(__dirname + "/public/index.html");
};
