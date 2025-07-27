import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import type {
  CreateSaleRequest,
  Sale,
  SaleReturnRequest,
  SalesHistoryFilters,
  SalesHistoryResponse,
  ProductSearchResult,
} from "./types";

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: baseQueryWithErrorHandling("/api/sales"),
  tagTypes: ["Sales", "Products"],
  endpoints: (builder) => ({
    // Create new sale
    createSale: builder.mutation<{ data: Sale; message: string }, CreateSaleRequest>({
      query: (saleData) => ({
        url: `/`,
        method: "POST",
        body: saleData,
      }),
      invalidatesTags: ["Sales"],
    }),

    // Get sales history
    getSalesHistory: builder.query<SalesHistoryResponse, SalesHistoryFilters>({
      query: (filters) => ({
        url: `/history`,
        method: "GET",
        params: filters,
      }),
      providesTags: ["Sales"],
    }),

    // Process sale return
    processSaleReturn: builder.mutation<{ data: Sale; message: string }, SaleReturnRequest>({
      query: (returnData) => ({
        url: `/returns`,
        method: "POST",
        body: returnData,
      }),
      invalidatesTags: ["Sales"],
    }),

    // Get sale by ID
    getSaleById: builder.query<{ data: Sale }, string>({
      query: (saleId) => ({
        url: `/${saleId}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),

    // Search products for POS
    searchProducts: builder.query<{ data: ProductSearchResult[] }, { query: string; outletId?: string }>({
      query: (params) => ({
        url: `/search`,
        method: "GET",
        params,
      }),
      providesTags: ["Products"],
    }),

    // Get sales statistics
    getSalesStats: builder.query<{ data: any }, { startDate?: string; endDate?: string; outletId?: string }>({
      query: (params) => ({
        url: `/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["Sales"],
    }),
  }),
});

export const {
  useCreateSaleMutation,
  useGetSalesHistoryQuery,
  useProcessSaleReturnMutation,
  useGetSaleByIdQuery,
  useSearchProductsQuery,
  useGetSalesStatsQuery,
} = salesApi; 