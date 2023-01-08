import { createApi } from '@reduxjs/toolkit/dist/query/react';
import { fetchBase } from './api.slice';
import { logoff } from './auth.slice';
import { auth_api_route, login_api_route, logout_api_route, refresh_api_route } from '@webtex/shared';

export const authAPI = createApi({
  reducerPath: 'authAPI',
  baseQuery: fetchBase,
  endpoints: (builder) => ({
    /**
     * @description Sends `POST base/auth` request to register user
     */
    register: builder.mutation<void, { email: string; password: string }>({
      query: (registrationData) => ({
        url: auth_api_route,
        method: 'POST',
        body: registrationData,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    /**
     * @description Sends `POST base/user` request to login user
     */
    signin: builder.mutation<void, { email: string; password: string }>({
      query: (credentials) => ({
        url: login_api_route,
        method: 'POST',
        body: { ...credentials },
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    /**
     * @description Sends `DELETE base/session` request to logout user
     */
    signout: builder.mutation<void, void>({
      query: () => ({
        url: logout_api_route,
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logoff());
          dispatch(authAPI.util.resetApiState());
        } catch (error) {
          return;
        }
      },
    }),
    /**
     * @description Sends `PATCH base/session` request to get refresh token
     */
    refresh: builder.mutation({
      query: () => ({
        url: refresh_api_route,
        method: 'POST',
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
