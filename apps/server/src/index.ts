import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { URL } from "url";

import Env from "./configs/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import { ignoreFavicon } from "./middleware/ignoreFavicon.js";
import session from "express-session";
import helmet from "helmet";
import connectRedis from "connect-redis";
import { redisCache } from "./database/otpStore.js";
import { Router } from "./router/router.js";

const server = express();
if (Env.mode === "development") {
}
server.disable("x-powered-by");
server.use(express.urlencoded({ extended: false }));
server.use(ignoreFavicon);
server.use(helmet());
server.use(cors(Env.cors));
server.use(express.json());
server.use(cookieParser());

const RedisStore = connectRedis(session);
server.use(
  session({
    secret: Env.session.secret,
    resave: Env.session.resave,
    name: Env.session.name,
    saveUninitialized: Env.session.saveUninitialized,
    cookie: Env.session.cookie,
    store: new RedisStore({ client: redisCache.redis as any }),
  })
);

const pathToMain = new URL("./public/404.html", import.meta.url).pathname;
server.use(Router);
server.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(pathToMain);
  } else {
    res.sendStatus(400);
  }
});
server.use(errorHandler);
server.listen(Env.port, () => {
  if (Env.mode === "development") {
    console.log(`In ${Env.mode}. Listening on ${Env.port}.`);
  }
});
