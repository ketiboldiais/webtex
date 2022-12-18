import { NextFunction, Request, Response } from "express";
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
  id: number;
  user: string; // the user id
  created: string;
  modified: string;
  title: string;
  url: string;
};

export interface NotesTable {
  id: Generated<number>;
  created: number;
  modified: number;
  user: string;
  url: string;
  title: string;
}

export interface GetNotesRequest extends Request {
  body: {
    user: string;
  };
}

export interface GetNotesResponse extends Response {
  data: Note[];
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

type TokenObj = { user: string };
