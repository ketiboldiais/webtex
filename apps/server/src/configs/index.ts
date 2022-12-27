import dotenv from "dotenv";
dotenv.config();

import { CorsOptions } from "cors";
import { CookieOptions } from "express-session";

const CORS_ORIGINS = ["https://www.webtex.cloud", "https://webtex.cloud"];
const CORS_OPTIONS_SUCCESS_STATUS = 200;
const CORS_INCLUDE_CREDENTIALS = true;
const PORT = 5173;

const COOKIES_SECURE_ONLY = true;
const COOKIES_HTTP_ONLY = true;
const COOKIES_SAME_SITE = "none";
const COOKIES_MAX_AGE = 24 * 60 * 1000;

const CACHE_EXPIRATION = 300;

const SESSION_RESAVE = false;
const SESSION_NAME = "sid";
const SESSION_SAVE_UNINITIALIZED = false;

// Don't touch this.

const Redis = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

Object.preventExtensions(Redis);
Object.seal(Redis);
Object.freeze(Redis);

Object.preventExtensions(CORS_ORIGINS);
Object.seal(CORS_ORIGINS);
Object.freeze(CORS_ORIGINS);

const cors: CorsOptions = {
  origin: CORS_ORIGINS,
  optionsSuccessStatus: CORS_OPTIONS_SUCCESS_STATUS,
  credentials: CORS_INCLUDE_CREDENTIALS,
};

Object.preventExtensions(cors);
Object.seal(cors);
Object.freeze(cors);

const cookie: CookieOptions = {
  secure: COOKIES_SECURE_ONLY,
  httpOnly: COOKIES_HTTP_ONLY,
  sameSite: COOKIES_SAME_SITE,
  maxAge: COOKIES_MAX_AGE,
};
Object.preventExtensions(cookie);
Object.seal(cookie);
Object.freeze(cookie);

const session = {
  resave: SESSION_RESAVE,
  secret: process.env.SESSION_SECRET as string,
  name: SESSION_NAME,
  saveUninitialized: SESSION_SAVE_UNINITIALIZED,
  cookie: cookie,
};
Object.preventExtensions(session);
Object.seal(session);
Object.freeze(session);

const email = {
  key: process.env.ACCESS_TOKEN_SECRET as string,
  expiration: process.env.JWT_EMAIL_EXPIRE,
};
Object.preventExtensions(email);
Object.seal(email);
Object.freeze(email);

const access = {
  key: process.env.ACCESS_TOKEN_SECRET as string,
  expiration: process.env.JWT_ACCESS_EXPIRE,
};
Object.preventExtensions(access);
Object.seal(access);
Object.freeze(access);
const refresh = {
  key: process.env.REFRESH_TOKEN_SECRET as string,
  expiration: process.env.JWT_REFRESH_EXPIRE,
};
Object.preventExtensions(refresh);
Object.seal(refresh);
Object.freeze(refresh);
const jwt = {
  access: access,
  refresh: refresh,
  email: email,
};
Object.preventExtensions(jwt);
Object.seal(jwt);
Object.freeze(jwt);

const mail = {
  user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_PW,
};

Object.preventExtensions(mail);
Object.seal(mail);
Object.freeze(mail);

const db = {
  username: process.env.DB_USER,
  password: process.env.DB_PW,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
};

Object.preventExtensions(db);
Object.seal(db);
Object.freeze(db);

const Env = {
  mode: process.env.NODE_ENV,
  redis: Redis,
  cors: cors,
  session: session,
  jwt: jwt,
  mail: mail,
  reqSpeedLimit: Number(process.env.MAX_REQUESTS),
  database: db,
  saltRounds: Number(process.env.SALT),
  port: PORT,
  cacheExpiration: CACHE_EXPIRATION,
};

Object.preventExtensions(Env);
Object.seal(Env);
Object.freeze(Env);

export default Env;
