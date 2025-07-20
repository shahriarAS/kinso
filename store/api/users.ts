import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "../baseQueryWithErrorHandling";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "staff";
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: "admin" | "manager" | "staff";
  isActive?: boolean;
  avatar?: string;
}

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithErrorHandling("/api/users"),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    // Get all users with pagination and search
    getUsers: builder.query<
      {
        data: User[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
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
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "User" as const,
                id: _id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // Get single user by ID
    getUser: builder.query<{ data: User }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, _id) => [{ type: "User", _id }],
    }),

    // Create new user
    createUser: builder.mutation<{ message: string; data: User }, UserInput>({
      query: (user) => ({
        url: "/",
        method: "POST",
        body: user,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // Update user
    updateUser: builder.mutation<
      { message: string; data: User },
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
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // Get user statistics
    getUserStats: builder.query<
      {
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        usersByRole: {
          admin: number;
          manager: number;
          staff: number;
        };
        recentUsers: User[];
      },
      void
    >({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // Search users by name or email
    searchUsers: builder.query<{ data: User[] }, string>({
      query: (searchTerm) => ({
        url: "/search",
        method: "GET",
        params: { q: searchTerm },
      }),
      providesTags: (result) =>
        result
          ? result.data.map(({ _id }) => ({ type: "User" as const, _id }))
          : [],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useSearchUsersQuery,
} = usersApi;
