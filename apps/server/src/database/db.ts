import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import Env from '../configs/index.js';
import { Database, UserEntry } from '../global.js';

const { Pool } = pg;

const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool(Env.database),
  }),
});

const createNewUser = (email: string, hash: string): UserEntry => {
  return { email, password: hash, verified: false, joined: new Date() };
};

const verifyUserDB = async (email: string) => {
  try {
    let result = await db
      .updateTable('users')
      .set({ verified: true })
      .where('email', '=', email)
      .returning('id')
      .executeTakeFirst();
    if (result === undefined) {
      return null;
    }
  } catch (error) {
    return null;
  }
};

const getUser = async (email: string) => {
  try {
    let result = await db
      .selectFrom('users')
      .select(['password', 'verified', 'user'])
      .where('email', '=', email)
      .executeTakeFirst();
    if (result) {
      return result;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const saveNewUser = async (user: UserEntry) => {
  try {
    let result = await db
      .insertInto('users')
      .values(user)
      .returning('id')
      .executeTakeFirst();
    if (result === undefined) {
      return null;
    }
  } catch (error) {
    return null;
  }
};

const findByEmail = async (email: string) => {
  try {
    let result = await db
      .selectFrom('users')
      .select(['password', 'verified', 'user'])
      .where('email', '=', email)
      .executeTakeFirst();
    if (result === null) {
      return null;
    }
  } catch (er) {
    return null;
  }
};

export { db, findByEmail, createNewUser, saveNewUser, getUser, verifyUserDB };
