import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Stock, StockInput, StockFilters } from "./types";

export const stockApi = createApi({
  reducerPath: "stockApi",
  baseQuery: baseQueryWithErrorHandling("/api/stock"),
  tagTypes: ["Stock"],
  endpoints: (builder) => ({
    // Get all stock with pagination and filters
    getStock: builder.query<
      {
        data: Stock[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
      StockFilters & {
        page?: number;
        limit?: number;
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
                type: "Stock" as const,
                _id,
              })),
              { type: "Stock", id: "LIST" },
            ]
          : [{ type: "Stock", id: "LIST" }],
    }),

    // Add new stock
    addStock: builder.mutation<
      { message: string; data: Stock },
      StockInput
    >({
      query: (stock) => ({
        url: "/",
        method: "POST",
        body: stock,
      }),
      invalidatesTags: [{ type: "Stock", id: "LIST" }],
    }),



    // Get stock by product ID
    getStockByProduct: builder.query<
      { data: Stock[] },
      { productId: string; locationType?: "warehouse" | "outlet" }
    >({
      query: ({ productId, locationType }) => ({
        url: "/",
        method: "GET",
        params: {
          productId,
          ...(locationType === "warehouse" && { warehouseId: { $exists: true } }),
          ...(locationType === "outlet" && { outletId: { $exists: true } }),
        },
      }),
      providesTags: (result, error, { productId }) => [
        { type: "Stock", productId },
        { type: "Stock", id: "LIST" },
      ],
    }),

    // Get low stock items
    getLowStock: builder.query<
      { data: Stock[] },
      { limit?: number }
    >({
      query: (params) => ({
        url: "/",
        method: "GET",
        params: {
          ...params,
          lowStock: true,
        },
      }),
      providesTags: [{ type: "Stock", id: "LOW_STOCK" }],
    }),

    // Get expiring stock items
    getExpiringStock: builder.query<
      { data: Stock[] },
      { limit?: number }
    >({
      query: (params) => ({
        url: "/",
        method: "GET",
        params: {
          ...params,
          expiringSoon: true,
        },
      }),
      providesTags: [{ type: "Stock", id: "EXPIRING" }],
    }),
  }),
});

export const {
  useGetStockQuery,
  useAddStockMutation,
  useGetStockByProductQuery,
  useGetLowStockQuery,
  useGetExpiringStockQuery,
} = stockApi; 