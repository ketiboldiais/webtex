import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response } from "express";

const fsPromises = fs.promises;

export const logEvents = async (message: string, logFileName: string) => {
  const date = `${Date.now()}`;
  const logItem = `${date}\t${uuid()}\t${message}\n`;

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
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
  next();
};
