import express, { Request, Response } from "express";
import path from "path";

const rootRoute = express.Router();

rootRoute.get("^/$|/index(.html)?", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

export default rootRoute;
