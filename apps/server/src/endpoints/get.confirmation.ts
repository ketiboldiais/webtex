import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { cache } from "../database/cache.js";
import { verifyUserDB } from "../database/db.js";
import Env from "src/configs/index.js";
import { EmailToken } from "src/global.js";

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const {
      user: { email, otp },
    } = jwt.verify(req.params.token, Env.jwt.email.key) as EmailToken;
    let cachedEmail = await cache.getValue(otp);
    if (cachedEmail === null) {
      return res.sendStatus(500);
    }
    if (cachedEmail !== email) {
      return res.sendStatus(500);
    }
    let result = await verifyUserDB(email);
    if (result === null) {
      return res.sendStatus(500);
    }
    await cache.delete(otp);
    return res.redirect(`https://webtex.cloud/login`);
  } catch (error) {
    return res.sendStatus(500);
  }
};
