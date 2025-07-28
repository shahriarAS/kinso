import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Stock, StockInput } from "./types";
import { PaginatedResponse, ApiResponse } from "@/types";

export const stockApi = createApi({
  reducerPath: "stockApi",
  baseQuery: baseQueryWithErrorHandling("/api/stock"),
  tagTypes: ["Stock"],
  endpoints: (builder) => ({
    // Get all stocks with pagination and filters
    getStocks: builder.query<
      PaginatedResponse<Stock>,
      {
        page?: number;
        limit?: number;
        location?: string;
        locationType?: string;
        product?: string;
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
                type: "Stock" as const,
                _id,
              })),
              { type: "Stock", id: "LIST" },
            ]
          : [{ type: "Stock", id: "LIST" }],
    }),

    // Get single stock by ID
    getStock: builder.query<ApiResponse<Stock>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Stock", id }],
    }),

    // Create new stock
    createStock: builder.mutation<
      ApiResponse<Stock>,
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
      ApiResponse<Stock>,
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
    deleteStock: builder.mutation<ApiResponse<void>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Stock", id: "LIST" }],
    }),

    // Transfer stock between locations
    transferStock: builder.mutation<
      ApiResponse<any>,
      {
        product: string;
        fromLocation: string;
        toLocation: string;
        fromLocationType: string;
        toLocationType: string;
        unit: number;
        reason?: string;
      }
    >({
      query: (transferData) => ({
        url: "/movement",
        method: "POST",
        body: transferData,
      }),
      invalidatesTags: [{ type: "Stock", id: "LIST" }],
    })
  }),
});

export const {
  useGetStocksQuery,
  useGetStockQuery,
  useCreateStockMutation,
  useUpdateStockMutation,
  useDeleteStockMutation,
  useTransferStockMutation,
} = stockApi;

// Alias for backward compatibility
export const useAddStockMutation = useCreateStockMutation; 