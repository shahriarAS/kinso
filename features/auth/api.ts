import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { LoginInput, RegisterInput, AuthResponse } from "./types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithErrorHandling("/api/auth"),
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    loginUser: builder.mutation<AuthResponse, LoginInput>({
      query: ({ email, password }) => ({
        url: "/login",
        method: "POST",
        body: {
          email,
          password,
        },
      }),
      invalidatesTags: ["Auth"],
    }),

    logoutUser: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;

          // Clear cache
          dispatch(authApi.util.resetApiState());

          // Wait for cache clearing
          await new Promise((resolve) => setTimeout(resolve, 150));

          // Navigate after cache is cleared
          window.location.href = "/login";
        } catch (err) {
          // Handle error silently
        }
      },
    }),

    registerUser: builder.mutation<
      { success: boolean; message: string },
      RegisterInput
    >({
      query: ({ name, email, password, password2 }) => ({
        url: "/register",
        method: "POST",
        body: {
          name,
          email,
          password,
          password2,
        },
      }),
      invalidatesTags: ["Auth"],
    }),

    fetchAuthUser: builder.query<AuthResponse, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogoutUserMutation,
  useRegisterUserMutation,
  useFetchAuthUserQuery,
} = authApi;
