import jwt from "jsonwebtoken";
import {
  jwtAccessKey,
  jwtAccessExpire,
  jwtRefreshKey,
  jwtRefreshExpire,
} from "src/configs";
import { TokenObj } from "src/types";

const access = (payload: TokenObj) => {
  return jwt.sign(payload, jwtAccessKey, { expiresIn: jwtAccessExpire });
};
const refresh = (payload: TokenObj) => {
  return jwt.sign(payload, jwtRefreshKey, { expiresIn: jwtRefreshExpire });
};

export const makeToken = { access, refresh };
