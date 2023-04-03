/**
 * @file App.tsx
 * Some preliminary comments:
 * There's a fair amount of complexity with this application,
 * but taking a functional approach makes things much easier.
 * First, there are a lot of states to manage:
 *
 * 1. The global, Redux state.
 * 2. The editor state.
 * 3. The toolbar state.
 * 4. The note list state.
 * 5. The change-history state.
 *
 * These states MUST ALL be kept in sync. The real challenge
 * is syncing the global Redux state with the Lexical editor
 * state. Lexical uses its own shadow DOM, and it uses flushSync
 * for certain updates. Accordingly, we can't use useEffect or
 * simple auto-save to save the user's current work. Doing so
 * can cause flushSync to trigger while React is already rendering.
 * Because of this friction, we must make even smaller substates
 * with React's useContext hook.
 */

/* -------------------------------------------------------------------------- */
/*                               NOTE UTILITIES                               */
/* -------------------------------------------------------------------------- */

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

/**
 * These are default notes. They're stringified ASTs
 * of the Lexical editor.
 *
 * WELCOME_NOTE_CONTENT
 * - The documentation note.
 *
 * EMPTY_NOTE
 * - The note used as a placeholder in the event
 *   the active note in Redux is undefined, as well
 *   as the note used when creating a new note.
 */

export const WelcomeNote = makeNote(
  `webtexDOCS`,
  "Welcome",
  WELCOME_NOTE_CONTENT,
);
export const BlankNote = makeNote(id(0), "", EMPTY_NOTE);

export function makeNote(id: string, title: string, content: string): Note {
  return {
    id,
    title,
    content,
    date: new Date().toLocaleDateString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
export function id(noteCount: number) {
  return `note${noteCount}`;
}

/* -------------------------------------------------------------------------- */
/*                              REDUX NOTE SLICE                              */
/* -------------------------------------------------------------------------- */
/**
 * We use Redux to manage the global state.
 */
import { PayloadAction } from "@reduxjs/toolkit";

/* ------------------------ Initial Note Slice State ------------------------ */

type NoteListObj = { [noteId: string]: Note };

interface NoteState {
  notelist: NoteListObj;
  notes: Note[];
  activeNote: Note;
  noteCount: number;
  trash: Note[];
}

let noteListArray: Note[] = [];

const initNoteList = await db_getNotes().then((notes) => {
  let init: NoteListObj = {};
  notes.forEach((note) => {
    noteListArray.push(note);
    init[note.id] = note;
  });
  init[WelcomeNote.id] = WelcomeNote;
  return init;
}).catch(() => ({ [WelcomeNote.id]: WelcomeNote }));

let trashListArray: Note[] = [];

await db_getTrashedNotes().then((notes) => {
  notes.forEach((note) => {
    trashListArray.push(note);
  });
});

const initialState: NoteState = {
  notelist: initNoteList,
  activeNote: noteListArray.length !== 0 ? noteListArray[0] : WelcomeNote,
  notes: [...noteListArray, WelcomeNote],
  trash: trashListArray,
  noteCount: Object.values(initNoteList).length,
};

/* -------------------------- Slice Initialization -------------------------- */

import { createSlice } from "@reduxjs/toolkit";

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    addNote(state, action: PayloadAction<Note>) {
      const newNote = action.payload;
      state.notes.unshift(action.payload);
      state.notelist[newNote.id] = newNote;
      state.noteCount = Object.values(state.notelist).length;
      state.activeNote = state.notelist[newNote.id];
    },
    deleteNote(state, action: PayloadAction<Note>) {
      if (state.noteCount > 1) {
        state.noteCount -= 1;
        delete state.notelist[action.payload.id];
        state.notes = state.notes.filter((n) => n.id !== action.payload.id);
        if (state.notes.length) {
          state.activeNote = state.notes[0];
        } else {
          state.activeNote = BlankNote;
        }
        state.trash.push(action.payload);
      } else {
        state.activeNote = BlankNote;
      }
    },
    setActiveNote(state, action: PayloadAction<Note>) {
      const activeNote = state.activeNote;
      state.notelist[activeNote.id] = state.activeNote;
      const note = action.payload;
      state.activeNote = note;
    },
    saveNote(state, action: PayloadAction<Note>) {
      const note = action.payload;
      state.notelist[note.id] = note;
      state.notes = state.notes.map((n) => n.id === note.id ? note : n);
      state.activeNote = note;
    },
    destroyNote(state, action: PayloadAction<Note>) {
      const argnote = action.payload;
      state.trash = state.trash.filter((note) => note.id !== argnote.id);
    },
    untrashNote(state, action: PayloadAction<Note>) {
      const argnote = action.payload;
      state.trash = state.trash.filter((note) => note.id !== argnote.id);
    },
  },
});

export const {
  saveNote,
  addNote,
  setActiveNote,
  deleteNote,
  untrashNote,
  destroyNote,
} = noteSlice.actions;

/* --------------------------- Listener Middleware -------------------------- */
/**
 * To save to the Dexie database, we use listener middleware.
 * We do so to keep the notes slice reducers as pure as possible.
 * Saving to Dexie is a side-effect, unnecessary for the the note
 * slice reducer to function.
 */
import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
  db_addNote,
  db_deleteNote,
  db_destroyNote,
  db_getNotes,
  db_getTrashedNotes,
  db_saveNote,
} from "src/db/db";

const noteListenerMiddleware = createListenerMiddleware();

/**
 * Saves a note to the database the moment a note is added.
 * Todo: Only add notes that actually have content. At the moment,
 * this listener will add notes blindly.
 */
noteListenerMiddleware.startListening({
  actionCreator: addNote,
  effect: async (action) => {
    await db_addNote(action.payload);
  },
});

/**
 * Deletes a note from the database
 * the moment a note is deleted.
 */
noteListenerMiddleware.startListening({
  actionCreator: deleteNote,
  effect: async (action) => {
    await db_deleteNote(action.payload);
  },
});

/**
 * Saves a note to the database
 * the moment a note is saved.
 * Todo: Limit this action as well.
 */
noteListenerMiddleware.startListening({
  actionCreator: saveNote,
  effect: async (action) => {
    await db_saveNote(action.payload);
  },
});

noteListenerMiddleware.startListening({
  actionCreator: destroyNote,
  effect: async (action) => {
    await db_destroyNote(action.payload);
  },
});

/**
 * Pointer to all the listeners.
 * We concatenate the pointee to
 * the Redux Store's middlware field.
 */
const noteListeners = noteListenerMiddleware.middleware;

/* -------------------------------------------------------------------------- */
/*                         Redux Store (Global State)                         */
/* -------------------------------------------------------------------------- */

import { configureStore } from "@reduxjs/toolkit";

const notesReducer = noteSlice.reducer;

export const store = configureStore({
  reducer: {
    notes: notesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat(noteListeners),
});

/* -------------------------------- Selectors ------------------------------- */

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { EMPTY_NOTE, WELCOME_NOTE_CONTENT } from "src/util";

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const getNotes = (): Note[] =>
  useAppSelector(
    (state) => state.notes.notes,
  );
export const getActiveNote = (): Note =>
  useAppSelector(
    (state) => state.notes.activeNote,
  );
export const getTrashedNotes = (): Note[] =>
  useAppSelector(
    (state) => state.notes.trash,
  );
