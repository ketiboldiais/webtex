import { getDate } from "@webtex/string";
import { makeId } from "../utils/index.js";
import { writeFile } from "@webtex/file";
import { NextFunction, Request, Response } from "express";
import { fileURLToPath } from "url";
import path from "path";
import Env from "src/configs/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logEvent = async (message: string) => {
  const time = getDate().localDate;
  const entry = `${time}\t${makeId(4)}\t${message}\n`;
  try {
    let dir = __dirname + "../../../logs/webtex.log";
    await writeFile(dir, entry);
  } catch (error) {
    console.log(error);
  }
};

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  if (Env.mode === "development") {
    logEvent(`${req.method}\t${req.url}`);
  }
  next();
};

const logit = async (message: string) => {
  if (Env.mode === "development") {
    try {
      await logEvent(message);
      return true;
    } catch (error) {
      return false;
    }
  }
};

export { logRequest, logit };
