export type Note = {
  id: number;
  created: Date;
  modified: Date;
  title: string;
  url: string;
  content: string;
};

export type USER = {
  user: string;
  active: boolean;
} | null;

export interface AUTH_STATE {
  user: USER;
  token: string | null;
}

export interface NOTE_STATE {
  currentNote: Note;
  notes: Note[];
}

export interface APP_STATE {
  user: string;
  notes: Note[];
}

export type SaveNewNoteRequest = {
  user: string;
  created: string;
  modified: string;
  filepath: string;
};

export type NoteList = Note[];

export type RegisterRequest = {
  email: string;
  password: string;
};

export type PasswordUpdateRequest = {
  id: string;
  password: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type EmailUpdateRequest = {
  id: string;
  currentEmail: string;
  newEmail: string;
  password: string;
  confirmPassword: string;
};

export type LoginRequest = {
  type: "LOGIN";
  payload: { email: string; password: string };
};

export type LogoutRequest = {
  type: "LOGOUT";
};

export type LoginResponse = {
  id: string;
};
