import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { LoginPayload } from '@webtex/shared';
import { set } from 'idb-keyval';

type AuthState = {
  token: string | null;
  isLoggedIn: boolean;
};

type SetCredsAction = PayloadAction<LoginPayload>;
type RefreshAction = PayloadAction<{ accessToken: string }>;

const initialAuthState: AuthState = { token: null, isLoggedIn: false };

const authSlice = createSlice({
  // This slice is called auth
  name: 'auth',
  // Initially the token is null
  initialState: initialAuthState,
  reducers: {
    setToken: (state, action: RefreshAction) => {
      const { accessToken } = action.payload;
      state.token = accessToken;
    },
    setSession: (state) => {
      state.isLoggedIn = true;
    },
    setCredentials: (state, action: SetCredsAction) => {
      const { accessToken, timestamp } = action.payload;
      state.token = accessToken;
      set('validSession', timestamp);
    },
    logout: (state) => {
      state.token = null;
      state.isLoggedIn = false;
      set('validSession', 0);
    },
  },
});

export const { setCredentials, logout, setToken, setSession } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
