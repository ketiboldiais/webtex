import { Request } from "express";
import { User } from "./user";

export interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export interface RegisterRequest extends Request {
  body: User;
}

export interface DeauthorizeRequest extends Request {
  body: {
    id: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
}

export interface EmailUpdateRequest extends Request {
  body: {
    id: string;
    currentEmail: string;
    newEmail: string;
    password: string;
    confirmPassword: string;
  };
}

export interface PasswordUpdateRequest extends Request {
  body: {
    id: string;
    password: string;
    newPassword: string;
    confirmNewPassword: string;
  };
}

export interface RefreshRequest extends Request {
  body: {
    user: string;
    email: string;
  };
}

export type TokenObj = { user: string };
