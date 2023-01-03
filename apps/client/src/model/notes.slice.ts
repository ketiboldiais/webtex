import { createSlice } from '@reduxjs/toolkit';
import { PayloadAction } from '@reduxjs/toolkit';
import { Note } from './notes.api';
import { List, LIST } from '@webtex/list';

const DEFAULT_NOTE_CONTENT = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`;

type RawNote = Note & { unsaved: boolean };
type AddNoteAction = PayloadAction<RawNote>;
type NoteIndexAction = PayloadAction<number>;

type NoteState = {
  notelist: LIST<RawNote>;
  currentNote: number;
  deletedNotes: LIST<RawNote>;
};

const initialState: NoteState = {
  notelist: List({
    title: '',
    created: new Date(),
    modified: new Date(),
    content: DEFAULT_NOTE_CONTENT,
    wordcount: 0,
    unsaved: true,
  }),
  currentNote: 0,
  deletedNotes: List<RawNote>(),
};

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    // Adds a note to the notes slice state.
    addNote: (state, action: AddNoteAction) => {
      state.notelist.push(action.payload);
    },
    setCurrentNoteIndex: (state, action: NoteIndexAction) => {
      state.currentNote = action.payload;
    },
  },
});

export const { addNote, setCurrentNoteIndex } = notesSlice.actions;

export const notesReducer = notesSlice.reducer;
