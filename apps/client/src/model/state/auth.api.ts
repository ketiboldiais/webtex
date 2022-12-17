import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

import { USER, AUTH_STATE } from "../../client";

// this is the starting state of auth
const initial_auth_state: AUTH_STATE = {
  user: null,
  token: null,
};




