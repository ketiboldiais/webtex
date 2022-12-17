import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth.slice";
import notesReducer from "./notes.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: notesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
