import { Note } from "../client";

export const BASE_URL = "http://localhost:5174";
export const REFRESH_ENDPOINT = "/refresh";
export const AUTH_ENDPOINT = "/auth";
export const USER_ENDPOINT = "/user";
export const NOTES_ENDPOINT = "/notes";
const DEFAULT_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export const DEFAULT_NOTE: Note = {
  id: 0,
  created: new Date(),
  modified: new Date(),
  title: "",
  url: "",
  content: DEFAULT_NOTE_CONTENT,
};
