import dotenv from "dotenv";
dotenv.config();

import express from "express";
import Env from "./configs/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";
import { ignoreFavicon } from "./middleware/ignoreFavicon.js";
import session from "express-session";
import helmet from "helmet";
import connectRedis from "connect-redis";
import { Router } from "./router/router.js";
import { logRequest } from "./middleware/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import { cache } from "./database/cache.js";

const RedisStore = connectRedis(session);
const server = express();

if (Env.mode === "development") {
  server.use(logRequest);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

server.use(express.static(path.join(__dirname, "public")));

server
  .disable("x-powered-by")
  .use(express.urlencoded({ extended: false }))
  .use(ignoreFavicon)
  .use(helmet())
  .use(cors(Env.cors))
  .use(express.json())
  .use(cookieParser())
  .use(
    session({
      secret: Env.session.secret,
      resave: Env.session.resave,
      name: Env.session.name,
      saveUninitialized: Env.session.saveUninitialized,
      cookie: Env.session.cookie,
      store: new RedisStore({ client: cache.redis as any }),
    })
  )
  .use(Router);

server.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    return res.sendFile(__dirname + "/public/404.html");
  } else {
    return res.sendStatus(404);
  }
});

server.use(errorHandler);

server.listen(Env.port, () => {
  if (Env.mode === "development") {
    console.log(`In ${Env.mode}. Listening on ${Env.port}.`);
  }
});
