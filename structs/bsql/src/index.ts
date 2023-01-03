import 'fake-indexeddb/auto';
import {
  openDB,
  deleteDB,
  wrap,
  unwrap,
  IDBPDatabase,
  DBSchema,
  StoreNames,
} from 'idb';

interface NoteDB extends DBSchema {
  notes: {
    key: string;
    value: {
      title: string;
      created: Date;
      modified: Date;
      content: string;
      wordcount: number;
    };
    indexes: {
      'by-title': string;
      'by-created': Date;
      'by-modified': Date;
      'by-wordcount': number;
    };
  };
}

