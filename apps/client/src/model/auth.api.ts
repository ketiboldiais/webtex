import { createApi } from "@reduxjs/toolkit/dist/query/react";
import {
  LoginPayload,
  AUTH,
  ServerMessage,
  User,
  SESSION,
  USER
} from "@webtex/shared";
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
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    /**
     * @description Sends `POST base/user` request to login user
     */
    signin: builder.mutation<LoginPayload, User>({
      query: (credentials) => ({
        url: USER,
        method: "POST",
        body: { ...credentials },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    /**
     * @description Sends `DELETE base/session` request to logout user
     */
    signout: builder.mutation({
      query: () => ({
        url: SESSION,
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
