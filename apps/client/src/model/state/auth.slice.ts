import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthResponse = {
  id: string | null;
  accessToken: string;
  notes: string[];
};

export interface AuthState {
  id: string | null;
  token: string | null;
  notes: string[];
}

const initialState: AuthState = {
  id: null,
  token: null,
  notes: [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { id, accessToken, notes } = action.payload;
      state.id = id;
      state.token = accessToken;
      state.notes = notes;
    },
    logout: (state) => {
      state.id = null;
      state.token = null;
      state.notes = [];
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
