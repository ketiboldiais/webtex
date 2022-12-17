import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";
import { Kysely, PostgresDialect, Generated } from "kysely";
import { Database } from "src/server";

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
