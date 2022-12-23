import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";

// configs
import { sessionConfig, corsConfig, PORT, MODE } from "./configs";

// dev tools
import morgan from "morgan";
import { Logger } from "./dev";

// client-server shared
import { AUTH, SESSION, USER } from "@webtex/types";

// PART middleware imports
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { ignoreFavicon } from "./middleware/ignoreFavicon";

import session from "express-session";
import helmet from "helmet";
import connectRedis from "connect-redis";
import Redis from "ioredis";

// PART Router imports
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";
import { sessionRouter } from "./routes/session.routes";
import rootRoute from "./routes/root.route";

const server = express();
if (MODE === "development") {
  server.use(Logger);
  server.use(morgan("dev"));
}

// configure redis client
const RedisStore = connectRedis(session);
const redis =
  process.env.NODE_ENV !== "production"
    ? new Redis({ host: "localhost", port: 6379 })
    : // FIXME - Set Redis URL in production
      new Redis(process.env.REDIS_URL as string);

/**
 * Disable header indicating
 * the server framework we're using.
 **/
server.disable("x-powered-by");

server.use(express.urlencoded({ extended: false }));

server.use(ignoreFavicon);
server.use(helmet());
server.use(cors(corsConfig));
server.use(express.json());
server.use(cookieParser());
server.use("/", express.static(path.join(__dirname, "public")));

/**
 * PART Handle to `base/auth` requests.
 **/
server.use(AUTH, authRouter);
server.use(
  session({
    ...sessionConfig,
    /**
     * Using ducktyping because the `@types` definition
     * is broken
     **/
    store: new RedisStore({ client: redis as any }),
  })
);

/**
 * PART Handle to `base/user` requests.
 **/
server.use(USER, userRouter);

/**
 * PART Handle `base/session` requests.
 */
server.use(SESSION, sessionRouter);

// TODO server.use(NOTE, noteRouter);

server.use("/", express.static(path.join(__dirname, "public")));
server.use("/", rootRoute);
server.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "public", "404.html"));
  } else {
    res.sendStatus(400);
  }
});

server.use(errorHandler);
server.listen(PORT, () => {
  if (MODE === "development") {
    console.log(`In ${MODE}. Listening on ${PORT}.`);
  }
});
