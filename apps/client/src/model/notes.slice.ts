import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';
import { Note } from './notes.api';
import { nanoid } from '@reduxjs/toolkit';

const DEFAULT_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export type RawNote = Note & { unsaved: boolean };

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
type NoteIndexAction = PayloadAction<number>;
type SetTitleAction = PayloadAction<string>;

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
  activeNote: RawNote | null;
};

const initialState: NoteState = {
  pastNotes: [],
  currentNotes: [],
  future: [],
  activeNote: null,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setActiveNote: (state, action: NoteIndexAction) => {
      state.activeNote = state.currentNotes[action.payload];
    },
    updateActiveNoteTitle: (state, action: SetTitleAction) => {
      if (state.activeNote) {
        state.activeNote.title = action.payload;
      }
    },
    deleteNote: (state, action: NoteIndexAction) => {
      state.pastNotes.push(state.currentNotes[action.payload]);
      const res = state.currentNotes.filter((_, i) => i !== action.payload);
      state.currentNotes = res;
    },
    addNote: (state) => {
      state.currentNotes.push(createEmptyNote());
    },
  },
});

export const { addNote, deleteNote, setActiveNote, updateActiveNoteTitle } =
  notesSlice.actions;

export const notesReducer = notesSlice.reducer;
