import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { createEmptyNote, notesReducer } from './notes.slice';
import { noteListeners } from './notes.middleware';
import { get } from 'idb-keyval';

let isLoggedIn = false;

try {
  let time = (await get('validSession')) as number;
  console.log(time);
  if (0 < time && time !== Date.now()) {
    isLoggedIn = false;
  }
} catch (_) {}

export const store = configureStore({
  reducer: {
    notes: notesReducer,
  },
  devTools: process.env.NODE_ENV === 'development',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([noteListeners])
});

export type RootState = ReturnType<typeof store.getState>;
export type StoreDispatch = typeof store.dispatch;

// Dispatches an action to the Redux store
export const useAppDispatch = () => useDispatch<StoreDispatch>();

//  Extracts data from the Redux store state
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Returns all notes
export const selectAllNotes = (state: RootState) => state.notes.currentNotes;

export const getActiveNote = (state: RootState) =>
  state.notes.currentNotes[state.notes.activeNote] ?? createEmptyNote();

export const getActiveNoteIndex = (state: RootState) => state.notes.activeNote;
