import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createSlice } from "@reduxjs/toolkit";
import { AUTH_STATE } from "../../client";

const initial_auth_state = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initial_auth_state,
  reducers: {},
});

export default authSlice.reducer;
