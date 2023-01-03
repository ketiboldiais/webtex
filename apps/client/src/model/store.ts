import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { authReducer } from './auth.slice';
import { notesReducer } from './notes.slice';
import { authAPI } from './auth.api';
import { get } from 'idb-keyval';

let isLoggedIn = false;

try {
  let time = (await get('validSession')) as number;
  if (time !== Date.now() && time !== 0) {
    isLoggedIn = true;
  }
} catch (_) {}

export const store = configureStore({
  reducer: {
    [authAPI.reducerPath]: authAPI.reducer,
    auth: authReducer,
    notes: notesReducer,
  },
  devTools: process.env.NODE_ENV === 'development',
  // needed for RTK-query to cache results
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([authAPI.middleware]),
  preloadedState: {
    auth: {
      token: null,
      isLoggedIn,
    },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type StoreDispatch = typeof store.dispatch;

// Dispatches an action to the Redux store
export const useAppDispatch = () => useDispatch<StoreDispatch>();

//  Extracts data from the Redux store state
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Returns the token currently stored in state.
export const selectToken = (state: RootState) => state.auth.token;

// Returns the session currently stored in IDB
export const selectLoginStatus = (state: RootState) => state.auth.isLoggedIn;

// Returns all notes
export const selectAllNotes = (state: RootState) => state.notes.notelist;

export const selectCurrentNoteIndex = (state: RootState) => state.notes.currentNote;