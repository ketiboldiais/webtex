import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { LoginPayload } from "@webtex/shared";
import { set } from "idb-keyval";

type AuthState = {
  token: string | null;
  validSession: number;
};

type SetCredsAction = PayloadAction<LoginPayload>;
type RefreshAction = PayloadAction<{ accessToken: string }>;

const initialAuthState: AuthState = { token: null, validSession: 0 };

const authSlice = createSlice({
  // This slice is called auth
  name: "auth",
  // Initially the token is null
  initialState: initialAuthState,
  reducers: {
    setToken: (state, action: RefreshAction) => {
      const { accessToken } = action.payload;
      state.token = accessToken;
    },
    setCredentials: (state, action: SetCredsAction) => {
      const { accessToken, timestamp } = action.payload;
      state.token = accessToken;
      state.validSession = Number(timestamp);
      set("validSession", timestamp);
    },
    logout: (state) => {
      state.token = null;
      state.validSession = 0;
      set("validSession", 0);
    },
  },
});

export const { setCredentials, logout, setToken } = authSlice.actions;
export const authReducer = authSlice.reducer;
