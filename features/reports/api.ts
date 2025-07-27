import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import {
  SalesReportResponse,
  InventoryReportResponse,
  CustomerReportResponse,
  ReportFilters,
  ReportRequest,
  StockMovementReport,
  ProfitLossReport,
} from "./types";

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQueryWithErrorHandling("/api/reports"),
  tagTypes: ["Reports"],
  endpoints: (builder) => ({
    // Get sales report
    getSalesReport: builder.query<{ success: boolean; data: SalesReportResponse }, ReportFilters>({
      query: (params) => ({
        url: "/sales",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // Get inventory report
    getInventoryReport: builder.query<{ success: boolean; data: InventoryReportResponse }, ReportFilters>({
      query: (params) => ({
        url: "/inventory",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // Get customer report
    getCustomerReport: builder.query<{ success: boolean; data: CustomerReportResponse }, ReportFilters>({
      query: (params) => ({
        url: "/customers",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // Get stock movement report
    getStockMovementReport: builder.query<{ success: boolean; data: StockMovementReport }, ReportFilters>({
      query: (params) => ({
        url: "/stock-movement",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // Get profit loss report
    getProfitLossReport: builder.query<{ success: boolean; data: ProfitLossReport }, ReportFilters>({
      query: (params) => ({
        url: "/profit-loss",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),

    // Export report
    exportReport: builder.mutation<{ success: boolean; data: string; message: string }, ReportRequest>({
      query: (request) => ({
        url: "/export",
        method: "POST",
        body: request,
      }),
    }),

    // Get report statistics
    getReportStats: builder.query<
      {
        success: boolean;
        data: {
          totalSales: number;
          totalRevenue: number;
          totalProducts: number;
          totalCustomers: number;
          lowStockItems: number;
          expiringItems: number;
        };
      },
      ReportFilters
    >({
      query: (params) => ({
        url: "/stats",
        method: "GET",
        params,
      }),
      providesTags: ["Reports"],
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetInventoryReportQuery,
  useGetCustomerReportQuery,
  useGetStockMovementReportQuery,
  useGetProfitLossReportQuery,
  useExportReportMutation,
  useGetReportStatsQuery,
} = reportsApi; 