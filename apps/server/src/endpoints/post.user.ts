import { validateAuthPayload } from "@webtex/lib";
import { ASYNC_ERROR, CLIENT_FAIL, SERVER_FAIL } from "@webtex/shared";
import { Request, Response } from "express";
import { getUser } from "../database/db.js";
import { verifyHash } from "../utils/index.js";

export const login = async (req: Request, res: Response) => {
  const data = validateAuthPayload(req.body);
  if (data === SERVER_FAIL) {
    return res.sendStatus(500);
  }
  try {
    const { email, password } = req.body;
    const foundUser = await getUser(email);
    if (foundUser === CLIENT_FAIL) {
      return res.sendStatus(400);
    }
    if (foundUser === ASYNC_ERROR) {
      return res.sendStatus(500);
    }
    const match = await verifyHash(password, foundUser.password);
    if (match === ASYNC_ERROR) {
      return res.sendStatus(500);
    }
    if (!match) {
      return res.sendStatus(400);
    }
    req.session.user = foundUser.user;
    return res.status(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};
