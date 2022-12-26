import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { LoginPayload } from "@webtex/shared";

type AuthState = {
  token: string | null;
};

type SetCredsAction = PayloadAction<LoginPayload>;

const initialAuthState: AuthState = { token: null };

const authSlice = createSlice({
  // This slice is called auth
  name: "auth",
  // Initially the token is null
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action: SetCredsAction) => {
      const { accessToken } = action.payload;
      state.token = accessToken;
    },
    logout: (state) => {
      state.token = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
