import dotenv from "dotenv";
dotenv.config();

import { SessionOptions } from "express-session";
import { CorsOptions } from "cors";

export const MODE = process.env.NODE_ENV;

export const jwtAccessKey = process.env.ACCESS_TOKEN_SECRET as string;
export const jwtRefreshKey = process.env.REFRESH_TOKEN_SECRET as string;
export const jwtAccessExpire = process.env.JWT_ACCESS_EXPIRE;
export const jwtRefreshExpire = process.env.JWT_REFRESH_EXPIRE;
export const reqSpeedLimit = Number(process.env.MAX_REQUESTS);
export const nodeMailUser = process.env.GMAIL_USER;
export const nodeMailpass = process.env.GMAIL_PW;

// FIXME - Change this port in production
export const PORT = Number(process.env.PORT) || 5173;

export const sessionConfig: SessionOptions = {
  /**
   * @property resave
   * If set to `true`, the session is aved back to the
   * session store, even if the session was never modified.
   * This is not necessary for Webtex.
   */
  resave: false,
  /**
   * @property secret
   * Used to sign session IDs.
   * NOTE In production, this secret is updated at randomized
   * time intervals from a private server elsewhere.
   * Do not update the secret manually.
   */
  secret: process.env.SESSION_SECRET as string,
  /**
   * @property name
   * The name of the session ID cookie set
   * in the response and read from in the request.
   */
  name: "sid",
  /**
   * @property saveUninitialized
   * Forces an uninitialized session to be saved
   * to the store. A session is considered
   * uninitialized when it is new and unmodified.
   * E.g., if the user is not logged in and sends a request
   * (such as registering), then the session is stored in
   * the store.
   * This is not necessary for Webtex, since sessions
   * are only used for logins.
   */
  saveUninitialized: false,
  cookie: {
    /**
     * @property secure
     * Only HTTPS is allowed on these connections.
     */
    secure: true,
    /**
     * @property httpOnly
     * Client side JS not permitted to read
     * cookies.
     */
    httpOnly: true,
    /**
     * @property sameSite
     * `none` - All cookies from both first-party and
     * cross-site requests.
     * If set to `none`, then the `secure`
     * property must also be set to `true`.
     * We're setting this to `none` because
     * the frontend is on a separate domain.
     */
    sameSite: "none",
    /**
     * @property maxAge
     * Session cookie expires
     * after 1 day.
     */
    maxAge: 24 * 60 * 60 * 1000,
  },
};

/**
 * @description Configuration for `cors` middleware
 */
export const corsConfig: CorsOptions = {
  // FIXME - Change these URLs to the client site domain in production
  origin: ["https://www.webtex.cloud", "https://webtex.cloud"],
  optionsSuccessStatus: 200,
  credentials: true,
};

// FIXME - Set Redis URL in production
export const RedisConfig = { host: "localhost", port: 6379 };
