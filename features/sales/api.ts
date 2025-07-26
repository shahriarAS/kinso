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
  baseQuery: baseQueryWithErrorHandling("/api"),
  tagTypes: ["Sales", "Products"],
  endpoints: (builder) => ({
    // Product search endpoint
    searchProducts: builder.query<ProductSearchResult[], { query: string; outletId?: string }>({
      query: ({ query, outletId }) => ({
        url: `/products/search`,
        method: "GET",
        params: { query, outletId },
      }),
      providesTags: ["Products"],
    }),

    // Create new sale
    createSale: builder.mutation<{ data: Sale; message: string }, CreateSaleRequest>({
      query: (saleData) => ({
        url: `/sales`,
        method: "POST",
        body: saleData,
      }),
      invalidatesTags: ["Sales"],
    }),

    // Get sales history
    getSalesHistory: builder.query<SalesHistoryResponse, SalesHistoryFilters>({
      query: (filters) => ({
        url: `/sales/history`,
        method: "GET",
        params: filters,
      }),
      providesTags: ["Sales"],
    }),

    // Process sale return
    processSaleReturn: builder.mutation<{ data: Sale; message: string }, SaleReturnRequest>({
      query: (returnData) => ({
        url: `/sales/returns`,
        method: "POST",
        body: returnData,
      }),
      invalidatesTags: ["Sales"],
    }),

    // Get sale by ID
    getSaleById: builder.query<{ data: Sale }, string>({
      query: (saleId) => ({
        url: `/sales/${saleId}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),
  }),
});

export const {
  useSearchProductsQuery,
  useCreateSaleMutation,
  useGetSalesHistoryQuery,
  useProcessSaleReturnMutation,
  useGetSaleByIdQuery,
} = salesApi; 