import { createListenerMiddleware, createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';
import { Note, dbGetNotes } from './notes.api';
import { nanoid } from '@reduxjs/toolkit';

export const DEFAULT_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;
export const WELCOME_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Hi! Webtex is a note taking application geared towards technical subjects.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export function createEmptyNote(
  title: string = '',
  content: string = DEFAULT_NOTE_CONTENT
): Note {
  return {
    title,
    content,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    id: nanoid(7),
  };
}

// action types
type IndexPayload = PayloadAction<number>;
type DeleteNotePayload = PayloadAction<{ index: number; id: string }>;
type StringPayload = PayloadAction<string>;
type NewNotePayload = PayloadAction<Note>;
export type IndexedNote = { note: Note; index: number };

export const templateNote: Note = {
  title: '',
  content: DEFAULT_NOTE_CONTENT,
  created: new Date().toDateString(),
  modified: new Date().toDateString(),
  id: nanoid(7),
};

type NoteState = {
  pastNotes: Note[];
  currentNotes: Note[];
  future: Note[];
  activeNote: number;
  unsavedNotes: string[];
};

let initialNotes = await dbGetNotes();
const defaultNotes: Note[] = [
  {
    title: 'Welcome',
    content: WELCOME_NOTE_CONTENT,
    created: new Date().toDateString(),
    modified: new Date().toDateString(),
    id: nanoid(7),
  },
];

const initialState: NoteState = {
  pastNotes: [],
  currentNotes: initialNotes.length === 0 ? defaultNotes : initialNotes,
  future: [],
  activeNote: 0,
  unsavedNotes: [],
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action: NewNotePayload) => {
      state.currentNotes.push(action.payload);
    },
    deleteNote: (state, action: DeleteNotePayload) => {
      state.currentNotes.splice(action.payload.index, 1);
    },
    setActiveNote: (state, action: IndexPayload) => {
      state.activeNote = action.payload;
    },
    saveNote: {
      reducer: (
        state,
        action: PayloadAction<{
          title: string;
          content: string;
          modified: string;
        }>
      ) => {
        const { title, content, modified } = action.payload;
        state.currentNotes[state.activeNote].title = title;
        state.currentNotes[state.activeNote].content = content;
        state.currentNotes[state.activeNote].modified = modified;
      },
      prepare: (title: string, content: string) => {
        return {
          payload: {
            title,
            content,
            modified: new Date().toISOString(),
          },
        };
      },
    },
    updateContent: (state, action: StringPayload) => {
      state.unsavedNotes[state.activeNote] = action.payload;
    },
    updateTitle: (state, action: StringPayload) => {
      state.currentNotes[state.activeNote].title = action.payload;
    },
  },
});

export const {
  addNote,
  deleteNote,
  setActiveNote,
  saveNote,
  updateTitle,
  updateContent,
} = notesSlice.actions;

export const notesReducer = notesSlice.reducer;
