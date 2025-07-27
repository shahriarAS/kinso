import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Stock, StockInput, StockMovementInput, StockStatsResponse } from "./types";

export const stockApi = createApi({
  reducerPath: "stockApi",
  baseQuery: baseQueryWithErrorHandling("/api/stock"),
  tagTypes: ["Stock"],
  endpoints: (builder) => ({
    // Get all stocks with pagination and filters
    getStocks: builder.query<
      {
        success: boolean;
        data: Stock[];
        pagination: {
          page: number;
          limit: number;
          total: number;
        };
      },
      {
        page?: number;
        limit?: number;
        locationId?: string;
        locationType?: "Warehouse" | "Outlet";
        productId?: string;
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
                type: "Stock" as const,
                _id,
              })),
              { type: "Stock", id: "LIST" },
            ]
          : [{ type: "Stock", id: "LIST" }],
    }),

    // Get single stock by ID
    getStock: builder.query<{ success: boolean; data: Stock }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Stock", id }],
    }),

    // Create new stock
    createStock: builder.mutation<
      { success: boolean; message: string; data: Stock },
      StockInput
    >({
      query: (stock) => ({
        url: "/",
        method: "POST",
        body: stock,
      }),
      invalidatesTags: [{ type: "Stock", id: "LIST" }],
    }),

    // Update stock
    updateStock: builder.mutation<
      { success: boolean; message: string; data: Stock },
      { _id: string; stock: Partial<StockInput> }
    >({
      query: ({ _id, stock }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: stock,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Stock", _id },
        { type: "Stock", id: "LIST" },
      ],
    }),

    // Delete stock
    deleteStock: builder.mutation<{ success: boolean; message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Stock", id: "LIST" }],
    }),

    // Transfer stock between locations
    transferStock: builder.mutation<
      { success: boolean; message: string; data: any },
      {
        productId: string;
        fromLocationId: string;
        toLocationId: string;
        fromLocationType: "Warehouse" | "Outlet";
        toLocationType: "Warehouse" | "Outlet";
        quantity: number;
        reason?: string;
      }
    >({
      query: (transferData) => ({
        url: "/movement",
        method: "POST",
        body: transferData,
      }),
      invalidatesTags: [{ type: "Stock", id: "LIST" }],
    }),

    // Get stock movement history
    getStockMovements: builder.query<
      {
        success: boolean;
        data: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
        };
      },
      {
        page?: number;
        limit?: number;
        productId?: string;
        locationId?: string;
        movementType?: string;
      }
    >({
      query: (params) => ({
        url: "/movement",
        method: "GET",
        params,
      }),
      providesTags: ["Stock"],
    }),

    // Get stock by product and location (for FIFO)
    getStockByProductAndLocation: builder.query<
      { success: boolean; data: Stock[] },
      {
        productId: string;
        locationId: string;
        locationType: "Warehouse" | "Outlet";
      }
    >({
      query: ({ productId, locationId, locationType }) => ({
        url: "/",
        method: "GET",
        params: { productId, locationId, locationType, limit: 1000 },
      }),
      providesTags: ["Stock"],
    }),

    // Get stock statistics
    getStockStats: builder.query<StockStatsResponse, {
      locationId?: string;
      locationType?: "Warehouse" | "Outlet";
    }>({
      query: (params) => ({
        url: "/stats",
        method: "GET",
        params,
      }),
      providesTags: ["Stock"],
    }),
  }),
});

export const {
  useGetStocksQuery,
  useGetStockQuery,
  useCreateStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useTransferStockMutation,
  useGetStockMovementsQuery,
  useGetStockByProductAndLocationQuery,
  useGetStockStatsQuery,
} = stockApi; 