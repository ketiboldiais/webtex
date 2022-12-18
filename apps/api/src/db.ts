import { NotesTable } from "./note";
import { UsersTable } from "./user";

export interface Database {
  users: UsersTable;
  notes: NotesTable;
}
