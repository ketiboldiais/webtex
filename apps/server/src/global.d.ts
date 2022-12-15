import { NextFunction, Request } from "express";

type Middleware = (req: Request, res: Response, nex?: NextFunction) => any;
