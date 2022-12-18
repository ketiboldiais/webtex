import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

type TokenObj = {
  accessToken: string;
};

type Credentials = {
  email: string;
  password: string;
};

import { Mutex } from "async-mutex";
import { logout, setCredentials } from "./auth.slice";
import { RootState } from "./store";
const mutex = new Mutex();

const BASE_URL = "http://localhost:5174";
const REFRESH_ENDPOINT = "/refresh";

/**
 * @description All queries use this base query.
 */
const baseQuery = fetchBaseQuery({
  // All outbound requests go straight to the server URL.
  baseUrl: BASE_URL,
  // All outbound requestions have credentials set.
  credentials: "include",
  // All outbound requests have accessTokens for authenticity.
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const fetchBase: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // using a mutex to prevent repeated attempts despite 401 unauthorized
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  // server sends 403 - forbidden - access token is expired
  if (result?.error?.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { method: "PUT", url: REFRESH_ENDPOINT },
          api,
          extraOptions
        );
        if (refreshResult.data) {
          // Dispatch to store the new token.
          const token = refreshResult.data as string;
          api.dispatch(setCredentials({ accessToken: token }));
        } else {
          // this works ok.
          api.dispatch(logout());
          window.location.href = "/login";
        }
      } finally {
        // DO NOT DELETE THIS LINE.
        // Otherwise, mutex remains locked.
        release();
      }
    }
  } else {
    // wait for mutex availability without locking the mutex
    await mutex.waitForUnlock();
    // now query
    result = await baseQuery(args, api, extraOptions);
  }
  return result;
};

const AUTH_ENDPOINT = "/auth";

export const authAPI = createApi({
  reducerPath: "authAPI",
  baseQuery: fetchBase,
  endpoints: (builder) => ({
    login: builder.mutation<TokenObj, Credentials>({
      query: (credentials) => ({
        url: AUTH_ENDPOINT,
        method: "POST",
        body: { ...credentials },
      }),
    }),
  }),
});
