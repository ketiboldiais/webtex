import { Request, Response } from "express";
import { Generated } from "kysely";

export type Note = {
  id: number;
  user: string; // the user id
  created: string;
  modified: string;
  title: string;
  url: string;
};

export interface NotesTable {
  id: Generated<number>;
  created: number;
  modified: number;
  user: string;
  url: string;
  title: string;
}

export interface GetNotesRequest extends Request {
  body: {
    user: string;
  };
}

export interface GetNotesResponse extends Response {
  data: Note[];
}

export interface SaveNewNoteRequest extends Request {
  body: Note;
}

export interface DeleteNoteRequest extends Request {
  body: {
    id: string;
    user: string;
  };
}
