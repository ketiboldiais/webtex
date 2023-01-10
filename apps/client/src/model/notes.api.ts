import Dexie, { Table } from 'dexie';

const dbName = 'webtexNotes';
const dbVersion = 1;

export type Note = {
  count?: number;
  title: string;
  created: string;
  modified: string;
  content: string;
  id: string;
};

export class NoteDB extends Dexie {
  notes!: Table<Note>;
  constructor() {
    super(dbName);
    this.version(dbVersion).stores({
      notes: '++count, title, created, modified, content, id',
    });
  }
}

export const db = new NoteDB();

export async function dbAddNote(note: Note) {
  try {
    await db.notes.add(note);
    return true;
  } catch (error) {
    return false;
  }
}

export async function dbSaveNote(note: Note) {
}

export async function dbGetNotes() {
  try {
    const notelist = await db.notes.toArray();
    return notelist;
  } catch (error) {
    return [];
  }
}

export async function dbDeleteNote(noteId: string) {
  try {
    let result = await db.notes.where('id').equals(noteId).delete();
    return result;
  } catch (error) {
    return false;
  }
}
