import { NextFunction, Request } from "express";
import { Generated } from "kysely";

type Middleware = (req: Request, res: Response, nex?: NextFunction) => any;

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

export type User = {
  email: string;
  password: string;
};

export type Note = {
  user: string; // the user id
  created: Date;
  modified: Date;
  title: string;
  url: string;
};

export interface NotesTable {
  id: Generated<number>;
  created: number;
  modified: number;
  user: string; // the url
  url: string;
  title: string;
}

export interface GetNotesRequest extends Request {
  body: {
    user: string;
  };
}

export interface SaveNewNoteRequest extends Request {
  body: Note;
}

export interface DeleteNoteRequest extends Request {
  body: {
    id: string;
    user: string;
  };
}

export interface Database {
  users: UsersTable;
  notes: NotesTable;
}

interface LoginRequest extends Request {
  body: User;
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

export interface LoginResponse extends Response {}
