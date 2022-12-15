import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./api.slice";
import { authReducer } from "./auth.slice";

// create store
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  // middleware for caching results
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const selectUser = (state: RootState) => state.auth.id;
export const selectToken = (state: RootState) => state.auth.token;
export const selectNotes = (state: RootState) => state.auth.notes;
