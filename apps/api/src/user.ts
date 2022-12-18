import { Generated } from "kysely";

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
