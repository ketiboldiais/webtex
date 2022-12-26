import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import Env from "../configs/index.js";
import {
  ASYNC_ERROR,
  CLIENT_FAIL,
  SERVER_FAIL,
  SERVER_SUCCESS,
} from "@webtex/shared";
import { Database, UserEntry } from "../global.js";

const { Pool } = pg;

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool(Env.database),
  }),
});

const createNewUser = (email: string, hash: string): UserEntry => {
  return { email, password: hash, verified: false, joined: new Date() };
};

const getUser = async (email: string) => {
  try {
    let result = await db
      .selectFrom("users")
      .select(["password", "verified", "user"])
      .where("email", "=", email)
      .executeTakeFirst();
    if (result) {
      return result;
    }
    return CLIENT_FAIL;
  } catch (error) {
    return ASYNC_ERROR;
  }
};

const saveNewUser = async (user: UserEntry) => {
  try {
    let result = await db
      .insertInto("users")
      .values(user)
      .returning("id")
      .executeTakeFirst();
    if (result) {
      return SERVER_SUCCESS;
    }
    return SERVER_FAIL;
  } catch (error) {
    return ASYNC_ERROR;
  }
};

const findByEmail = async (email: string) => {
  try {
    return await db
      .selectFrom("users")
      .select(["password", "verified", "user"])
      .where("email", "=", email)
      .executeTakeFirst();
  } catch (er) {
    return null;
  }
};

export { db, findByEmail, createNewUser, saveNewUser, getUser };
