import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User } from "@/types/user";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    prepareHeaders(headers) {
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    loginUser: builder.mutation<
      {
        message: string;
        user: User;
      },
      { email: string; password: string }
    >({
      query: ({ email, password }) => ({
        url: "/login",
        method: "post",
        body: {
          email,
          password,
        },
      }),
      invalidatesTags: ["Auth"],
    }),
    logoutUser: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/logout",
        method: "post",
      }),
      invalidatesTags: ["Auth"],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;

          // Clear cache
          dispatch(authApi.util.resetApiState());

          // Wait for cache clearing
          await new Promise(resolve => setTimeout(resolve, 150));

          // Navigate after cache is cleared
          window.location.href = "/login";

        } catch (err) {
          // Handle error
        }
      },
    }),
    registerUser: builder.mutation<
      {
        message: string;
      },
      { name: string; email: string; password: string; password2: string }
    >({
      query: ({ name, email, password, password2 }) => ({
        url: "/register",
        method: "post",
        body: {
          name,
          email,
          password,
          password2,
        },
      }),
      invalidatesTags: ["Auth"],
    }),
    fetchAuthUser: builder.query<
      {
        message: string;
        user: User;
      },
      void
    >({
      query: () => ({
        url: "/profile",
        method: "get",
      }),
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogoutUserMutation,
  useFetchAuthUserQuery,
} = authApi;
