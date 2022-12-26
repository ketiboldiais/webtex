import { validateAuthPayload } from "@webtex/lib";
import {
  ASYNC_ERROR,
  CLIENT_FAIL,
  CLIENT_SUCCESS,
  SERVER_FAIL,
} from "@webtex/shared";
import { Request, Response } from "express";
import { createNewUser, findByEmail, saveNewUser } from "../database/db.js";
import { hash, message } from "../utils/index.js";

/**
 * @file Handler for registering a new account.
 * @route POST /auth
 * @access Public
 * @remark No JWT handling here, those are only issued
 * at login, since the user still has to verify their
 * email.
 */

export const register = async (req: Request, res: Response) => {
  const { body } = req;
  const result = validateAuthPayload(body);
  if (result === SERVER_FAIL || result === ASYNC_ERROR) {
    return res.status(400).json(message(CLIENT_FAIL));
  }
  const { email, password } = req.body;
  try {
    const isDuplicate = await findByEmail(email);
    if (isDuplicate) {
      return res.status(400).json(message(CLIENT_FAIL));
    }
    const pwd = await hash(password);
    if (pwd === SERVER_FAIL || pwd === ASYNC_ERROR) {
      return res.status(400).json(message(SERVER_FAIL));
    }
    const newUser = createNewUser(email, pwd);
    const successfulSave = await saveNewUser(newUser);
    if (successfulSave === SERVER_FAIL || successfulSave === ASYNC_ERROR) {
      return res.status(400).json(message(SERVER_FAIL));
    }
    return res.status(200).json(message(CLIENT_SUCCESS));
  } catch (error) {
    return res.sendStatus(500);
  }
};
