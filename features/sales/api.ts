import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import type {
  CreateSaleRequest,
  Sale,
  SaleReturnRequest,
  SalesHistoryFilters,
  SalesHistoryResponse,
  ProductSearchResult,
  SalesStatsResponse,
} from "./types";
import { ApiResponse } from "@/types";

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: baseQueryWithErrorHandling("/api/sales"),
  tagTypes: ["Sales", "Products"],
  endpoints: (builder) => ({
    // Create new sale
    createSale: builder.mutation<ApiResponse<Sale>, CreateSaleRequest>({
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
    processSaleReturn: builder.mutation<ApiResponse<Sale>, SaleReturnRequest>({
      query: (returnData) => ({
        url: `/returns`,
        method: "POST",
        body: returnData,
      }),
      invalidatesTags: ["Sales"],
    }),

    // Get sale by ID
    getSaleById: builder.query<ApiResponse<Sale>, string>({
      query: (saleId) => ({
        url: `/${saleId}`,
        method: "GET",
      }),
      providesTags: ["Sales"],
    }),

    // Update sale
    updateSale: builder.mutation<
      ApiResponse<Sale>,
      { saleId: string; saleData: Partial<CreateSaleRequest> }
    >({
      query: ({ saleId, saleData }) => ({
        url: `/${saleId}`,
        method: "PUT",
        body: saleData,
      }),
      invalidatesTags: ["Sales"],
    }),

    // Delete sale
    deleteSale: builder.mutation<ApiResponse<void>, string>({
      query: (saleId) => ({
        url: `/${saleId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sales"],
    }),

    // Search products for POS
    searchProducts: builder.query<ApiResponse<ProductSearchResult[]>, { query: string; outletId?: string }>({
      query: (params) => ({
        url: `/search`,
        method: "GET",
        params,
      }),
      providesTags: ["Products"],
    }),

    // Get sales statistics
    getSalesStats: builder.query<SalesStatsResponse, { startDate?: string; endDate?: string; outletId?: string }>({
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
  useUpdateSaleMutation,
  useDeleteSaleMutation,
  useSearchProductsQuery,
  useGetSalesStatsQuery,
} = salesApi; 