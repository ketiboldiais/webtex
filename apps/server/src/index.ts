import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors, { CorsOptions } from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { Logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { ignoreFavicon } from "./middleware/ignoreFavicon";
import rootRoute from "./routes/root";
import userRoutes from "./routes/user.routes";

const MODE = process.env["NODE_ENV"];
const PORT = Number(process.env["PORT"]) || 5174;

const server = express();

if (MODE === "development") {
  server.use(Logger);
  server.use(morgan("dev"));
}

const corsOptions: CorsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["POST", "GET", "DELETE", "PATCH"],
  optionsSuccessStatus: 200,
  credentials: true,
};

server.use(cors(corsOptions));
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.use(cookieParser());
server.use(ignoreFavicon);
server.use("/", express.static(path.join(__dirname, "public")));
server.use("/", rootRoute);
server.use("/user", userRoutes);
server.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "public", "404.html"));
  } else {
    res.sendStatus(400);
  }
});

server.use(errorHandler);

server.listen(PORT, "127.0.0.1", () => {
  if (MODE === "development") {
    console.log(`In ${MODE}. Listening on ${PORT}.`);
  }
});
