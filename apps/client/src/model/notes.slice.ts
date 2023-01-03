import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';
import { Note } from './notes.api';
import { nanoid } from '@reduxjs/toolkit';

const DEFAULT_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

export type RawNote = Note & { unsaved: boolean };
type SaveNoteAction = PayloadAction<RawNote>;
type NoteIndexAction = PayloadAction<number>;

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
  activeNote?: RawNote;
};

const initialState: NoteState = {
  pastNotes: [],
  currentNotes: [templateNote],
  future: [],
  activeNote: templateNote,
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setActiveNote: (state, action: NoteIndexAction) => {
      state.activeNote = state.currentNotes[action.payload];
      console.log(action.payload);
    },
    deleteNote: (state, action: NoteIndexAction) => {
      state.pastNotes.push(state.currentNotes[action.payload]);
      const res = state.currentNotes.filter((_, i) => i !== action.payload);
      state.currentNotes = res;
    },
    saveNote: {
      reducer: (state, action: SaveNoteAction) => {
        state.currentNotes.push(action.payload);
      },
      prepare: (created: string, title: string, content: string) => {
        return {
          payload: {
            created,
            title,
            content,
            modified: new Date().toDateString(),
            unsaved: false,
            id: nanoid(7),
          },
        };
      },
    },
    // Adds a new blank note to the notes slice state.
    addNote: (state) => {
      state.currentNotes.push({ ...templateNote, id: nanoid(7) });
    },
  },
});

export const { saveNote, addNote, deleteNote, setActiveNote } =
  notesSlice.actions;

export const notesReducer = notesSlice.reducer;
