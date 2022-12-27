import { nanoid } from "nanoid";

export type USER = { id: string; name: string; job: string; age: number };

// prettier-ignore
export const userTable: USER[] = [
  { id: nanoid(5), name: "sarah", job: "mechanic", age: 25 },
  { id: nanoid(5), name: "jim"  , job: "plumber" , age: 48 },
  { id: nanoid(5), name: "dosan", job: "surgeon" , age: 67 },
  { id: nanoid(5), name: "dirk" , job: "engineer", age: 22 },
  { id: nanoid(5), name: "lori" , job: "student" , age: 17 },
  { id: nanoid(5), name: "kento", job: "plumber" , age: 48 },
  { id: nanoid(5), name: "danny", job: "lawyer"  , age: 48 },
];
