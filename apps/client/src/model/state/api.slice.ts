import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, REFRESH_ENDPOINT } from "src/config";
import { setCredentials, logout } from "./auth.slice";
import { RootState } from "./store";

export type RefreshResponseData = {
  accessToken: string;
};

/**
 * @description Query handler
 * This is the Redux wrapper for the
 * `fetch` API.
 */

type BaseQueryType = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
>;

const baseQuery: BaseQueryType = fetchBaseQuery({
  // all requests start with `BASE_URL`
  baseUrl: BASE_URL,

  // ensures httpOnly-cookie is always returned on every query
  credentials: "include",

  // include authorization header to API requests
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * @description Wrapper for `baseQuery`
 * When we send the `token` in `baseQuery`, the `token`
 * may be expired. But, we may still have a `refreshToken`.
 * So, if we have a `refreshToken` and the `baseQuery` fails,
 * we should reattempt with the `refreshToken`. Note that we
 * do not have any access to the `refreshToken`. That token is
 * an httpOnly cookie, so the only way to send it is to
 * reattempt. Thus, we want to wrap `baseQuery` in another
 * function.
 * @param args
 * - The object returned from the query function for the endpoint.
 * @param api
 * - Generally, description of the query at present.
 * - The `BaseQueryAPI` object from Redux. Contains:
 *   1. `signal` - An `AbortSignal` object (browser API). Can be used to abort
 *       DOM requests and/or read whether the request is aborted.
 *   2. `dispatch` - The `store.dispatch` method for the store associated
 *      with the query.
 *   3. `getState` - Access the current store state.
 *   4. `extra` - Sets `thunk.extraArgument` for `configureStore`'s
 *      `getDefaultMiddleware` option.
 * @param extraOptions
 * - Additional properties that can be set on the API endpoint, to be passed
 *   to `baseQuery`.
 */

const baseQueryWithReauth: BaseQueryType = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 403) {
    console.log(`Sending refresh token`);
    // send refresh token
    const refreshResult = await baseQuery(REFRESH_ENDPOINT, api, extraOptions);
    console.log(refreshResult);
    if (refreshResult?.data) {
      const id = (api.getState() as RootState).auth.id;
      const notes = (api.getState() as RootState).auth.notes;
      const refreshResponseData = refreshResult.data as RefreshResponseData;
      // store new token
      api.dispatch(
        setCredentials({
          id,
          notes,
          accessToken: refreshResponseData.accessToken,
        })
      );
      // retry original query with new access token
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});
