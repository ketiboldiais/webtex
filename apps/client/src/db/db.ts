/* -------------------------------------------------------------------------- */
/*                                  DATABASE                                  */
/* -------------------------------------------------------------------------- */
/**
 * Webtex uses IndexedDB to store notes. The IndexedDB API is fairly hairy
 * to work with, and it's best to just use an existing, well-tested library.
 * In this case, we use Dexie.
 */
import Dexie, { Table } from "dexie";
import { Note, WelcomeNote } from "src/state/state";

export class NoteDB extends Dexie {
  notes!: Table<Note>;
  trash!: Table<Note>;
  constructor() {
    super("webtexDB");
    this.version(2).stores({
      notes: "id, title, content, date",
      trash: "id, title, content, date",
    });
  }
}

export const db = new NoteDB();

export async function db_getNotes() {
  try {
    const noteList = await db.notes.toArray();
    return noteList;
  } catch (error) {
    return [WelcomeNote];
  }
}


export async function db_getTrashedNotes() {
  try {
    const noteList = await db.trash.toArray();
    return noteList;
  } catch (error) {
    return [];
  }
}

export async function db_addNote(note: Note) {
  try {
    await db.notes.add(note);
    await db.trash.where('id').equals(note.id).delete();
  } catch {}
}

export async function db_deleteNote(note: Note) {
  try {
    await db.notes.where("id").equals(note.id).delete();
    await db.trash.add(note);
  } catch {}
}

export async function db_destroyNote(note:Note) {
  try {
    await db.trash.where('id').equals(note.id).delete();
  } catch {}
}

export async function db_saveNote(note: Note) {
  try {
    await db.notes.update(note.id, note);
  } catch {}
}
