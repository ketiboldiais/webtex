import fs from "fs";
import path from "path";
import { NextFunction, Request, Response } from "express";
import { getDate } from "@webtex/string/dist";
import { makeID } from "src/middleware/makeID";

const fsPromises = fs.promises;
export const logEvents = async (message: string, logFileName: string) => {
  const date = getDate().localDate;
  const logItem = `${makeID(8)}\t${date}\t${message}\n`;
  try {
    if (!fs.existsSync(path.join(__dirname, "../..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "../..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "../..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

export const Logger = (req: Request, res: Response, next: NextFunction) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "webtex.log");
  next();
};

export const devlog = (message: string) => {
  if (process.env.NODE_ENV === "development") {
    logEvents(`${message}`, "webtex.log");
  }
};
