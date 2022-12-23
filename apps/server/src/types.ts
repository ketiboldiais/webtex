import { DateObj } from "@webtex/types";
import { Generated } from "kysely";

export type UserEntry = {
  email: string;
  password: string;
  verified: boolean;
  joined: Date;
};

export interface UsersTable {
  id: Generated<number>;
  user: Generated<string>;
  email: string;
  password: string;
  verified: boolean;
  joined: Date;
}

export interface Database {
  users: UsersTable;
  notes: NotesTable;
}

export type TokenObj = { user: string };
export type LoginPayload = { accessToken: string };

export type Note = {
  id: number;
  user: string; // the user id
  title: string;
  created: Date;
  modified: Date;
  url: string;
};

export interface NotesTable {
  id: Generated<number>;
  user: string;
  title: string;
  created: Date;
  modified: Date;
  url: string;
}

export type ClientNote = {
  id: string;
  user: string;
  created: string;
  modified: string;
  title: string;
};
