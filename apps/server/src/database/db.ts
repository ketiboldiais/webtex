import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { Kysely, PostgresDialect, Generated } from "kysely";

export interface UsersTable {
  pk: Generated<number>;
  id: Generated<string>;
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
  id: string;
  created: number;
  modified: number;
  filepath: string;
};

export interface NotesTable {
  pk: Generated<number>;
  id: string;
  created: number;
  modified: number;
  filepath: string;
}

export interface Database {
  users: UsersTable;
  notes: NotesTable;
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PW,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
    }),
  }),
});
