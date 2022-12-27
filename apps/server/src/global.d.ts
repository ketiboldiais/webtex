import "express-session";
import { Generated } from "kysely";

declare module "express-session" {
  interface SessionData {
    user: string;
  }
}

type UserEntry = {
  email: string;
  password: string;
  verified: boolean;
  joined: Date;
};

interface UsersTable {
  id: Generated<number>;
  user: Generated<string>;
  email: string;
  password: string;
  verified: boolean;
  joined: Date;
}

interface Database {
  users: UsersTable;
  notes: NotesTable;
}

type TokenObj = { user: string };
type LoginPayload = { accessToken: string };

type Note = {
  id: number;
  user: string; // the user id
  title: string;
  created: Date;
  modified: Date;
  url: string;
};

interface NotesTable {
  id: Generated<number>;
  user: string;
  title: string;
  created: Date;
  modified: Date;
  url: string;
}

type ClientNote = {
  id: string;
  user: string;
  created: string;
  modified: string;
  title: string;
};

interface EmailToken {
  user: {
    email: string;
    otp: string;
  };
}

interface AuthToken {
  timestamp: number;
}
