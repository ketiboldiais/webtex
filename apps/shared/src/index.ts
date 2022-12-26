import { Session } from "express-session";
export * from "./endpoints.js";
export * from "./messages.js";

export type DateObj = {
  utcDate: string;
  localDate: string;
};

export type LoginReq = Request & {
  session: Session;
};

export type User = {
  email: string;
  password: string;
};

export type LoginPayload = { accessToken: string };
