import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import type { Sale, SaleInput } from "./types";
import { ApiResponse } from "@/types";

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: baseQueryWithErrorHandling("/api/sales"),
  tagTypes: ["Sales", "Products"],
  endpoints: (builder) => ({
    // Create new sale
    createSale: builder.mutation<ApiResponse<Sale>,SaleInput>({
      query: (saleData) => ({
        url: `/`,
        method: "POST",
        body: saleData,
      }),
      invalidatesTags: ["Sales"],
    }),

    // Get sales history
    getSalesHistory: builder.query<ApiResponse<Sale[]>, {
        page?: number;
        limit?: number;
        search?: string;
        outlet?: string;
        customer?: string;
        paymentMethod?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      }>({
      query: (filters) => ({
      url: `/history`,
      method: "GET",
      params: filters,
      }),
      providesTags: ["Sales"],
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
      { saleId: string; saleData: Partial<SaleInput> }
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
  }),
});

export const {
  useCreateSaleMutation,
  useGetSalesHistoryQuery,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
  useDeleteSaleMutation,
} = salesApi; 