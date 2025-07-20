import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "../baseQueryWithErrorHandling";
import { Warehouse } from "@/types";

export interface WarehouseInput extends Omit<Warehouse, "_id"> {}

export const warehousesApi = createApi({
  reducerPath: "warehousesApi",
  baseQuery: baseQueryWithErrorHandling("/api/warehouses"),
  tagTypes: ["Warehouse"],
  endpoints: (builder) => ({
    // Get all warehouses with pagination and filters
    getWarehouses: builder.query<
      {
        data: Warehouse[];
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
              ...result.data.map(({ _id }) => ({ type: "Warehouse" as const, _id })),
              { type: "Warehouse", id: "LIST" },
            ]
          : [{ type: "Warehouse", id: "LIST" }],
    }),

    // Get single warehouse by ID
    getWarehouse: builder.query<
      { data: Warehouse },
      string
    >({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Warehouse", id }],
    }),

    // Create new warehouse
    createWarehouse: builder.mutation<
      { message: string; data: Warehouse },
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
      { message: string; data: Warehouse },
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
    deleteWarehouse: builder.mutation<
      { message: string },
      string
    >({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Warehouse", id: "LIST" }],
    }),

    // Get warehouse inventory
    getWarehouseInventory: builder.query<
      {
        data: {
          warehouse: Warehouse;
          products: Array<{
            product: {
              _id: string;
              name: string;
              upc: string;
              sku: string;
              category: string;
            };
            quantity: number;
            unit: string;
            dp: number;
            mrp: number;
          }>;
          totalProducts: number;
          totalValue: number;
        };
      },
      string
    >({
      query: (warehouseId) => ({
        url: `/${warehouseId}/inventory`,
        method: "GET",
      }),
      providesTags: (result, error, warehouseId) => [
        { type: "Warehouse", id: warehouseId },
      ],
    }),

    // Get warehouse statistics
    getWarehouseStats: builder.query<
      {
        totalWarehouses: number;
        totalProducts: number;
        totalValue: number;
        lowStockProducts: number;
        warehouses: Array<{
          _id: string;
          name: string;
          location: string;
          productCount: number;
          totalValue: number;
        }>;
      },
      void
    >({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      providesTags: ["Warehouse"],
    }),
  }),
});

export const {
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetWarehouseInventoryQuery,
  useGetWarehouseStatsQuery,
} = warehousesApi; 