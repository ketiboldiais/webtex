import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { Logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { ignoreFavicon } from "./middleware/ignoreFavicon";
import { AUTH, USER } from "@webtex/types";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";
import sessions from "express-session";
import helmet from "helmet";

const MODE = process.env["NODE_ENV"];
const PORT = Number(process.env["PORT"]) || 5174;

const server = express();

if (MODE === "development") {
  server.use(Logger);
  server.use(morgan("dev"));
}

const corsWhiteList = ["http://localhost:5173", "http://127.0.0.1:5173"];
const corsOptions: CorsOptions = {
  origin: corsWhiteList,
  optionsSuccessStatus: 200,
  credentials: true,
};
server.disable("x-powered-by");
server.use(helmet());
server.use(cors(corsOptions));
server.use(
  sessions({
    secret: process.env.SESSION_SECRET as string,
    name: "sid",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  })
);
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.use(cookieParser());
server.use(ignoreFavicon);
server.use(AUTH, authRouter);
server.use(USER, userRouter);
server.use(errorHandler);

server.listen(PORT, "127.0.0.1", () => {
  if (MODE === "development") {
    console.log(`In ${MODE}. Listening on ${PORT}.`);
  }
});
