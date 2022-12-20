import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import { authReducer } from "./auth.slice";
import { notesAPI } from "./notes.slice";
import { authAPI } from "./auth.api";

export const store = configureStore({
  reducer: {
    [authAPI.reducerPath]: authAPI.reducer,
    [notesAPI.reducerPath]: notesAPI.reducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV === "development",
  // needed for RTK-query to cache results
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({}).concat([authAPI.middleware, notesAPI.middleware]),
});

export type RootState = ReturnType<typeof store.getState>;

export type StoreDispatch = typeof store.dispatch;

/**
 * @description Dispatches an action to the Redux store
 */
export const useAppDispatch = () => useDispatch<StoreDispatch>();

/**
 * @description Extracts data from the Redux store state
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * @description Returns the token currently stored in state.
 */
export const selectToken = (state: RootState) => state.auth.token;
