import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Warehouse, WarehouseInput } from "@/features/warehouses/types";
import { PaginatedResponse, ApiResponse } from "@/types";

export const warehousesApi = createApi({
  reducerPath: "warehousesApi",
  baseQuery: baseQueryWithErrorHandling("/api/warehouses"),
  tagTypes: ["Warehouse"],
  endpoints: (builder) => ({
    // Get all warehouses with pagination and filters
    getWarehouses: builder.query<
      PaginatedResponse<Warehouse>,
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
        result?.data
          ? [
            ...result.data.map(({ _id }) => ({
              type: "Warehouse" as const,
              _id,
            })),
            { type: "Warehouse", id: "LIST" },
          ]
          : [{ type: "Warehouse", id: "LIST" }],
    }),

    // Get single warehouse by ID
    getWarehouse: builder.query<ApiResponse<Warehouse>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Warehouse", id }],
    }),

    // Create new warehouse
    createWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      WarehouseInput
    >({
      query: (warehouse) => ({
        url: "/",
        method: "POST",
        body: warehouse,
      }),
      invalidatesTags: [{ type: "Warehouse", id: "LIST" }],
    }),

    // Update warehouse
    updateWarehouse: builder.mutation<
      ApiResponse<Warehouse>,
      { _id: string; warehouse: Partial<WarehouseInput> }
    >({
      query: ({ _id, warehouse }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: warehouse,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Warehouse", _id },
        { type: "Warehouse", id: "LIST" },
      ],
    }),

    // Delete warehouse
    deleteWarehouse: builder.mutation<ApiResponse<void>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Warehouse", id: "LIST" }],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehousesApi;
