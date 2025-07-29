import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Outlet, OutletInput } from "@/features/outlets/types";
import { PaginatedResponse, ApiResponse } from "@/types";

export const outletsApi = createApi({
  reducerPath: "outletsApi",
  baseQuery: baseQueryWithErrorHandling("/api/outlets"),
  tagTypes: ["Outlet"],
  endpoints: (builder) => ({
    // Get all outlets with pagination and filters
    getOutlets: builder.query<
      PaginatedResponse<Outlet>,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        type?: string;
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
                type: "Outlet" as const,
                _id,
              })),
              { type: "Outlet", id: "LIST" },
            ]
          : [{ type: "Outlet", id: "LIST" }],
    }),

    // Get single outlet by ID
    getOutlet: builder.query<ApiResponse<Outlet>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Outlet", id }],
    }),

    // Create new outlet
    createOutlet: builder.mutation<ApiResponse<Outlet>, OutletInput>({
      query: (outlet) => ({
        url: "/",
        method: "POST",
        body: outlet,
      }),
      invalidatesTags: [{ type: "Outlet", id: "LIST" }],
    }),

    // Update outlet
    updateOutlet: builder.mutation<
      ApiResponse<Outlet>,
      { _id: string; outlet: Partial<OutletInput> }
    >({
      query: ({ _id, outlet }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: outlet,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Outlet", _id },
        { type: "Outlet", id: "LIST" },
      ],
    }),

    // Delete outlet
    deleteOutlet: builder.mutation<ApiResponse<void>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Outlet", id: "LIST" }],
    }),
  }),
});

export const {
  useGetOutletsQuery,
  useGetOutletQuery,
  useCreateOutletMutation,
  useUpdateOutletMutation,
  useDeleteOutletMutation,
} = outletsApi;
