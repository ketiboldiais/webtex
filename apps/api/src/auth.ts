import { Request } from "express";
import { User } from "./user";

export interface LoginRequest extends Request {
  body: User;
}

export interface RegisterRequest extends Request {
  body: User;
}

export interface RefreshRequest extends Request {
  body: {
    user: string;
    email: string;
  };
}

export type TokenObj = { user: string };
export type LoginPayload = { accessToken: string };
