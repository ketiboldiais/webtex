import dotenv from "dotenv";
dotenv.config();

import { CorsOptions } from "cors";
import { CookieOptions } from "express-session";


const ENVIRONMENT_MODE = process.env.NODE_ENV ?? "development";
const PORT = 5173;

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY ?? "";
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY ?? "";
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME ?? "";
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION ?? "";

const DATABASE_USERNAME = process.env.DB_USER ?? ""; 
const DATABASE_PASSWORD = process.env.DB_PW ?? ""; 
const DATABASE_HOST = process.env.DB_HOST ?? ""; 
const DATABASE_PORT = process.env.DB_PORT ?? ""; 
const DATABASE_NAME = process.env.DB_NAME ?? ""; 

const JWT_ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET ?? "";
const JWT_REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET ?? "";
const JWT_EMAIL_TOKEN_SECRET = process.env.JWT_EMAIL_TOKEN_SECRET ?? "";
const JWT_EMAIL_EXPIRATION = process.env.JWT_EMAIL_EXPIRE ?? "";

const MAIL_SERVICE = process.env.MAIL_SERVICE ?? "";
const MAIL_USER = process.env.MAIL_USER ?? "";
const MAIL_PASS = process.env.MAIL_PW ?? "";

const SESSIONS_SECRET = process.env.SESSION_SECRET ?? "";
const SESSION_RESAVE = false;
const SESSION_NAME = "sid";
const SESSION_SAVE_UNINITIALIZED = false;

const CORS_ORIGINS = [ "https://www.webtex.cloud", "https://webtex.cloud" ];
const CORS_OPTIONS_SUCCESS_STATUS = 200;
const CORS_INCLUDE_CREDENTIALS = true;

const COOKIES_SECURE_ONLY = true;
const COOKIES_HTTP_ONLY = true;
const COOKIES_SAME_SITE = "none";
const COOKIES_MAX_AGE = 24 * 60 * 1000;
const CACHE_EXPIRATION = 300;
const SALT_ROUNDS = process.env.SALT;
const REQUEST_SPEED_LIMIT = process.env.MAX_REQUESTS ?? 1;

// This section was autogenerated. Do not edit.

const Redis = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
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
  secret: SESSIONS_SECRET,
  name: SESSION_NAME,
  saveUninitialized: SESSION_SAVE_UNINITIALIZED,
  cookie: cookie,
};
Object.preventExtensions(session);
Object.seal(session);
Object.freeze(session);
const email = {
  key: JWT_EMAIL_TOKEN_SECRET,
  expiration: JWT_EMAIL_EXPIRATION,
};
Object.preventExtensions(email);
Object.seal(email);
Object.freeze(email);
const access = {
  key: JWT_ACCESS_TOKEN_SECRET,
  expiration: process.env.JWT_ACCESS_EXPIRE,
};
Object.preventExtensions(access);
Object.seal(access);
Object.freeze(access);
const refresh = {
  key: JWT_REFRESH_TOKEN_SECRET,
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
  service: MAIL_SERVICE,
  user: MAIL_USER,
  pass: MAIL_PASS,
};
Object.preventExtensions(mail);
Object.seal(mail);
Object.freeze(mail);
const db = {
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  host: DATABASE_HOST,
  port: Number(DATABASE_PORT),
  database: DATABASE_NAME,
};
Object.preventExtensions(db);
Object.seal(db);
Object.freeze(db);
const aws = {
  accessKey: AWS_ACCESS_KEY,
  secretKey: AWS_SECRET_KEY,
  bucketRegion: AWS_BUCKET_REGION,
  bucketName: AWS_BUCKET_NAME
};
Object.preventExtensions(aws);
Object.seal(aws);
Object.freeze(aws);
const Env = {
  mode: ENVIRONMENT_MODE,
  aws: aws,
  redis: Redis,
  cors: cors,
  session: session,
  jwt: jwt,
  mail: mail,
  reqSpeedLimit: Number(REQUEST_SPEED_LIMIT),
  database: db,
  saltRounds: Number(SALT_ROUNDS),
  port: PORT,
  cacheExpiration: CACHE_EXPIRATION,
};
Object.preventExtensions(Env);
Object.seal(Env);
Object.freeze(Env);

export default Env;
