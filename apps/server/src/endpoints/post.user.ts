import jwt from 'jsonwebtoken';
import { validateAuthPayload } from '@webtex/lib';
import { Request, Response } from 'express';
import { getUser } from '../database/db.js';
import Env from 'src/configs/index.js';
import { verifyHash } from 'src/utils/index.js';

/**
 * @file Handles login.
 * @route `POST /user`
 */

export const login = async (req: Request, res: Response) => {
  const data = validateAuthPayload(req.body);
  if (data === null) {
    return res.sendStatus(500);
  }
  try {
    const { email, password } = req.body;
    const foundUser = await getUser(email);
    if (foundUser === null || foundUser === undefined) {
      return res.sendStatus(400);
    }
    const match = await verifyHash(password, foundUser.password);
    if (!match) {
      return res.sendStatus(400);
    }
    const timestamp = Date.now() + 86400000;
    const loginPayload = { timestamp };
    const accessToken = jwt.sign(loginPayload, Env.jwt.access.key, {
      expiresIn: Env.jwt.access.expiration,
    });
    const refreshToken = jwt.sign(loginPayload, Env.jwt.refresh.key, {
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    req.session.user = foundUser.user;
    return res.status(200).json({ accessToken, timestamp });
  } catch (error) {
    return res.sendStatus(500);
  }
};
