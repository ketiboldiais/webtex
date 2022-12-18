import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type AuthState = {
  token: string | null;
};

type SetCredsAction = PayloadAction<{ accessToken: string }>;
const initialAuthState: AuthState = { token: null };

const authSlice = createSlice({
  name: "auth",
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
