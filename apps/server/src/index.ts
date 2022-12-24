import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import { sessionConfig, corsConfig, PORT, MODE } from "./configs";
import morgan from "morgan";
import { Logger } from "./dev";
import { AUTH, SESSION, USER } from "@webtex/types";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { ignoreFavicon } from "./middleware/ignoreFavicon";
import session from "express-session";
import helmet from "helmet";
import connectRedis from "connect-redis";
import { redisCache } from "./database/otpStore";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";
import { sessionRouter } from "./routes/session.routes";
import rootRoute from "./routes/root.route";

const server = express();

if (MODE === "development") {
  server.use(Logger);
  server.use(morgan("dev"));
}

server.disable("x-powered-by");
server.use(express.urlencoded({ extended: false }));
server.use(ignoreFavicon);
server.use(helmet());
server.use(cors(corsConfig));
server.use(express.json());
server.use(cookieParser());
server.use("/", express.static(path.join(__dirname, "public")));

// PART Handle to `base/auth` requests.
server.use(AUTH, authRouter);

// PART SESSIONS
const RedisStore = connectRedis(session);
server.use(
  session({
    store: new RedisStore({ client: redisCache.redis as any }),
    ...sessionConfig,
  })
);

// PART Handle to `base/user` requests.
server.use(USER, userRouter);

// PART Handle `base/session` requests.
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
