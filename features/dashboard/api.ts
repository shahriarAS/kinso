import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { DashboardStats, SalesAnalytics, InventoryAlerts } from "./types";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithErrorHandling("/api/dashboard"),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    // Get dashboard overview statistics
    getDashboardStats: builder.query<
      DashboardStats,
      {
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: "/stats",
        method: "GET",
        params,
      }),
      providesTags: ["Dashboard"],
    }),

    // Get sales analytics
    getSalesAnalytics: builder.query<
      SalesAnalytics,
      {
        period: "daily" | "weekly" | "monthly";
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: "/sales-analytics",
        method: "GET",
        params,
      }),
      providesTags: ["Dashboard"],
    }),

    // Get inventory alerts
    getInventoryAlerts: builder.query<InventoryAlerts, void>({
      query: () => ({
        url: "/inventory-alerts",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetSalesAnalyticsQuery,
  useGetInventoryAlertsQuery,
} = dashboardApi;
