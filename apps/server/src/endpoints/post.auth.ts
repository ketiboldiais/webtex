/**
 * @file Handler for registering a new account.
 * @route POST /auth
 * @access Public
 * @remark No JWT handling here, those are only issued
 * at login, since the user still has to verify their
 * email.
 */

import jwt from 'jsonwebtoken';
import { validateAuthPayload } from '@webtex/lib';
import { Request, Response } from 'express';
import { createNewUser, findByEmail, saveNewUser } from '../database/db.js';
import { hash, makeId } from '../utils/index.js';
import { cache } from '../database/cache.js';
import { buildMail, nodeMailer } from 'src/middleware/mailer.js';
import Env from 'src/configs/index.js';
import { EmailToken } from 'src/global.js';

export const register = async (req: Request, res: Response) => {
  const { body } = req;
  const data = validateAuthPayload(body);
  if (data === null) {
    return res.sendStatus(400);
  }
  const { email, password } = data;
  try {
    const isDuplicate = await findByEmail(email);
    if (isDuplicate) {
      return res.sendStatus(400);
    }
    const pwd = await hash(password);
    if (pwd === undefined || pwd === null) {
      return res.sendStatus(400);
    }
    const newUser = createNewUser(email, pwd);
    const savedUser = await saveNewUser(newUser);
    if (savedUser === null || savedUser === undefined) {
      return res.sendStatus(400);
    }
    if (savedUser === null || savedUser=== undefined) {
      return res.sendStatus(400);
    }
    const otp = makeId(7);
    await cache.saveTemp(otp, email);
    const otpPayload: EmailToken = { user: { email: email, otp: otp } };
    jwt.sign(
      otpPayload,
      Env.jwt.email.key,
      { expiresIn: Env.jwt.email.expiration },
      (error, otpToken) => {
        if (error) {
          return res.sendStatus(500);
        } else if (otpToken) {
          let mail = buildMail(email, otpToken);
          nodeMailer.sendMail(mail);
        } else {
          res.sendStatus(500);
        }
      }
    );
    return res.status(200);
  } catch (error) {
    return res.sendStatus(500);
  }
};
