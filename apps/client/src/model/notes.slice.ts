import { PrepareAction, createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';
import { Note } from './notes.api';
import { nanoid } from '@reduxjs/toolkit';

export const DEFAULT_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export type RawNote = Note & {
  unsaved: boolean;
};

export function createEmptyNote(): RawNote {
  return {
    title: '',
    content: DEFAULT_NOTE_CONTENT,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    unsaved: true,
    id: nanoid(7),
  };
}

// action types
type IdPayload = PayloadAction<string>;
type IndexPayload = PayloadAction<number>;
type NewTitlePayload = PayloadAction<string>;
export type IndexedNote = { note: RawNote; index: number };
type SaveNotePayload = PayloadAction<IndexedNote>;

export const templateNote: RawNote = {
  title: '',
  content: DEFAULT_NOTE_CONTENT,
  created: new Date().toDateString(),
  modified: new Date().toDateString(),
  unsaved: true,
  id: nanoid(7),
};

type NoteState = {
  pastNotes: RawNote[];
  currentNotes: RawNote[];
  future: RawNote[];
  activeNote: number;
};

const initialState: NoteState = {
  pastNotes: [],
  currentNotes: [],
  future: [],
  activeNote: 0,
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
        state.currentNotes[state.activeNote].unsaved = false;
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
    updateTitle: (state, action: NewTitlePayload) => {
      state.currentNotes[state.activeNote].title = action.payload;
    },
  },
});

export const { addNote, deleteNote, setActiveNote, saveNote, updateTitle } =
  notesSlice.actions;
export const notesReducer = notesSlice.reducer;
