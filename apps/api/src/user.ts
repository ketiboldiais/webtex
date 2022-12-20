import { Generated } from "kysely";
import { Request } from "express";

export type User = {
  email: string;
  password: string;
};

export interface UsersTable {
  id: Generated<number>;
  user: Generated<string>;
  email: string;
  password: string;
  active: boolean;
  joined: Date;
}

export type UserEntry = {
  email: string;
  password: string;
  active: boolean;
  joined: Date;
};

export interface DeleteUserRequest extends Request {
  body: {
    user: string;
    email: string;
    password: string;
  };
}

export interface EmailUpdateRequest extends Request {
  body: {
    user: string;
    currentEmail: string;
    newEmail: string;
    password: string;
  };
}

export interface PasswordUpdateRequest extends Request {
  body: {
    user: string;
    email: string;
    password: string;
    newPassword: string;
  };
}
