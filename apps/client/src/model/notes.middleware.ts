import { createListenerMiddleware } from '@reduxjs/toolkit';
import { addNote, deleteNote, saveNote, setActiveNote } from './notes.slice';
import { dbAddNote, dbDeleteNote } from './notes.api';

const noteListenerMiddleware = createListenerMiddleware();
noteListenerMiddleware.startListening({
  actionCreator: addNote,
  effect: async (action, api) => {
    await dbAddNote(action.payload);
  },
});
noteListenerMiddleware.startListening({
  actionCreator: deleteNote,
  effect: async (action, api) => {
    await dbDeleteNote(action.payload.id);
  },
});

export const noteListeners = noteListenerMiddleware.middleware;
