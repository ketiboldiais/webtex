import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { Mutex } from "async-mutex";
import { logout, setToken } from "./auth.slice";
import { RootState } from "./store";
import { AUTH, BASE } from "@webtex/shared";
const mutex = new Mutex();

/**
 * @description All queries use this base query.
 */
const baseQuery = fetchBaseQuery({
  // All outbound requests go straight to the server URL.
  baseUrl: BASE,
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
  if (result.error && result.error.status === 403) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          { method: "PATCH", url: AUTH },
          api,
          extraOptions
        );
        if (refreshResult.data) {
          // Dispatch to store the new token.
          const token = refreshResult.data as string;
          api.dispatch(setToken({ accessToken: token }));
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
    } else {
      // wait for mutex availability without locking the mutex
      await mutex.waitForUnlock();
      // now query
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
