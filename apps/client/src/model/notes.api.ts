import { DBSchema, openDB } from 'idb';
const DB_NAME = 'webtex-note-db';
const DB_VERSION = 1;

export type Note = {
  title: string;
  created: Date;
  modified: Date;
  content: string;
  wordcount: number;
};

export interface NoteDB extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: {
      'by-title': string;
      'by-created': Date;
      'by-modified': Date;
      'by-wordcount': number;
    };
  };
}

export const SaveNote = async (note: Note) => {
  const db = await openDB<NoteDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const noteStore = db.createObjectStore('notes', {
        keyPath: 'title',
      });
      noteStore.createIndex('by-created', 'created');
      noteStore.createIndex('by-modified', 'modified');
      noteStore.createIndex('by-title', 'title');
      noteStore.createIndex('by-wordcount', 'wordcount');
    },
  });
  await db.put('notes', note, note.title);
  return note;
};
