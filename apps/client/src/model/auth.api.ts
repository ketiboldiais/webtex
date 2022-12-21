import { createApi } from "@reduxjs/toolkit/dist/query/react";
import { LoginPayload, AUTH, ServerMessage, User } from "@webtex/types";
import { fetchBase } from "./api.slice";
import { logout } from "./auth.slice";

export const authAPI = createApi({
  reducerPath: "authAPI",
  baseQuery: fetchBase,
  endpoints: (builder) => ({
    /**
     * @description Sends `POST base/auth` request to register user
     */
    register: builder.mutation<ServerMessage, User>({
      query: (registrationData) => ({
        url: AUTH,
        method: "POST",
        body: registrationData,
      }),
    }),
    /**
     * @description Sends `GET base/auth` request to login user
     */
    signin: builder.mutation<LoginPayload, User>({
      query: (credentials) => ({
        url: AUTH,
        method: "GET",
        body: { ...credentials },
      }),
    }),
    /**
     * @description Sends `DELETE base/auth` request to logout user
     */
    signout: builder.mutation({
      query: () => ({
        url: AUTH,
        method: "DELETE",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
          dispatch(authAPI.util.resetApiState());
        } catch (error) {
          return;
        }
      },
    }),
    /**
     * @description Sends `PATCH base/auth` request to get refresh token
     */
    refresh: builder.mutation({
      query: () => ({
        url: AUTH,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useSigninMutation,
  useSignoutMutation,
  useRefreshMutation,
} = authAPI;
