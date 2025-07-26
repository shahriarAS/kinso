import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Outlet, OutletInput, OutletInventory, OutletStats } from "@/features/outlets/types";

export const outletsApi = createApi({
  reducerPath: "outletsApi",
  baseQuery: baseQueryWithErrorHandling("/api/outlets"),
  tagTypes: ["Outlet"],
  endpoints: (builder) => ({
    // Get all outlets with pagination and filters
    getOutlets: builder.query<
      {
        data: Outlet[];
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
                type: "Outlet" as const,
                _id,
              })),
              { type: "Outlet", id: "LIST" },
            ]
          : [{ type: "Outlet", id: "LIST" }],
    }),

    // Get single outlet by ID
    getOutlet: builder.query<{ data: Outlet }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Outlet", id }],
    }),

    // Create new outlet
    createOutlet: builder.mutation<
      { message: string; data: Outlet },
      OutletInput
    >({
      query: (outlet) => ({
        url: "/",
        method: "POST",
        body: outlet,
      }),
      invalidatesTags: [{ type: "Outlet", id: "LIST" }],
    }),

    // Update outlet
    updateOutlet: builder.mutation<
      { message: string; data: Outlet },
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
    deleteOutlet: builder.mutation<{ message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Outlet", id: "LIST" }],
    }),

    // Get outlet inventory
    getOutletInventory: builder.query<
      {
        data: OutletInventory;
      },
      string
    >({
      query: (outletId) => ({
        url: `/${outletId}/inventory`,
        method: "GET",
      }),
      providesTags: (result, error, outletId) => [
        { type: "Outlet", id: outletId },
      ],
    }),

    // Get outlet statistics
    getOutletStats: builder.query<
      {
        data: OutletStats;
      },
      void
    >({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      providesTags: ["Outlet"],
    }),
  }),
});

export const {
  useGetOutletsQuery,
  useGetOutletQuery,
  useCreateOutletMutation,
  useUpdateOutletMutation,
  useDeleteOutletMutation,
  useGetOutletInventoryQuery,
  useGetOutletStatsQuery,
} = outletsApi; 