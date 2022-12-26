import jwt from "jsonwebtoken";
import { TokenObj } from "../global.js";
import Env from "../configs/index.js";

const access = (payload: TokenObj) => {
  return jwt.sign(payload, Env.jwt.access.key, {
    expiresIn: Env.jwt.access.expiration,
  });
};
const refresh = (payload: TokenObj) => {
  return jwt.sign(payload, Env.jwt.refresh.key, {
    expiresIn: Env.jwt.access.expiration,
  });
};

export const makeToken = { access, refresh };
