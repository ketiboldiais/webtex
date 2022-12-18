export const BASE_URL = "http://localhost:5174";
export const REFRESH_URL = "/refresh";
export const AUTH_URL = "/auth";
export const USER_URL = "/user";
export const REGISTER_URL = "/user/register";
export const NOTES_URL = "/notes";
export const LOGOUT_URL = "/logout";
const DEFAULT_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export const DEFAULT_NOTE = {
  id: 0,
  user: "",
  created: "",
  modified: "",
  title: "",
  url: "",
  content: DEFAULT_NOTE_CONTENT,
};
