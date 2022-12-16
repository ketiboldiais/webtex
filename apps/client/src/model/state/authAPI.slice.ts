import { AUTH_ENDPOINT } from "../../config";
import { apiSlice } from "./api.slice";

export type CREDENTIALS = {
  email: string;
  password: string;
};

export const authAPISlice = apiSlice.injectEndpoints({
  // these are the different endpoints on the server side
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials: CREDENTIALS) => ({
        url: AUTH_ENDPOINT,
        method: "POST",
        body: { ...credentials },
      }),
    }),
  }),
});

export const { useLoginMutation } = authAPISlice;
