import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';
import { Note } from './notes.api';
import { nanoid } from '@reduxjs/toolkit';

export const DEFAULT_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export type RawNote = Note;

export function createEmptyNote(): RawNote {
  return {
    title: '',
    content: DEFAULT_NOTE_CONTENT,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    id: nanoid(7),
  };
}

// action types
type IndexPayload = PayloadAction<number>;
type StringPayload = PayloadAction<string>;
export type IndexedNote = { note: RawNote; index: number };

export const templateNote: RawNote = {
  title: '',
  content: DEFAULT_NOTE_CONTENT,
  created: new Date().toDateString(),
  modified: new Date().toDateString(),
  id: nanoid(7),
};

type NoteState = {
  pastNotes: RawNote[];
  currentNotes: RawNote[];
  future: RawNote[];
  activeNote: number;
  unsavedNotes: string[];
};

const initialState: NoteState = {
  pastNotes: [],
  currentNotes: [],
  future: [],
  activeNote: 0,
  unsavedNotes: [],
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state) => {
      state.currentNotes.push(createEmptyNote());
    },
    deleteNote: (state, action: IndexPayload) => {
      state.currentNotes.splice(action.payload, 1);
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
