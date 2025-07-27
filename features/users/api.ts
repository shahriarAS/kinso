import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { User, UserInput, UserUpdateInput } from "@/features/users/types";
import { PaginatedResponse, ApiResponse } from "@/types";

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithErrorHandling("/api/users"),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Get all users with pagination and search
    getUsers: builder.query<
      PaginatedResponse<User>,
      {
        page?: number;
        limit?: number;
        search?: string;
        role?: "admin" | "manager" | "staff";
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      }
    >({
      query: (params) => ({
        url: "/",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "User" as const,
                _id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // Get single user by ID
    getUser: builder.query<ApiResponse<User>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Create new user
    createUser: builder.mutation<ApiResponse<User>, UserInput>({
      query: (user) => ({
        url: "/",
        method: "POST",
        body: user,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // Update user
    updateUser: builder.mutation<
      ApiResponse<User>,
      { _id: string; user: UserUpdateInput }
    >({
      query: ({ _id, user }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: user,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "User", _id },
        { type: "User", id: "LIST" },
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<ApiResponse<void>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
