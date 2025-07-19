import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "../baseQueryWithErrorHandling";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithErrorHandling("/api/dashboard"),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    // Get dashboard overview statistics
    getDashboardStats: builder.query<
      {
        totalRevenue: number;
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
        pendingOrders: number;
        lowStockProducts: number;
        recentOrders: Array<{
          _id: string;
          orderNumber: string;
          customerName: string;
          totalAmount: number;
          status: string;
          orderDate: string;
        }>;
        topProducts: Array<{
          _id: string;
          name: string;
          totalSold: number;
          revenue: number;
        }>;
        revenueChart: Array<{
          date: string;
          revenue: number;
          orders: number;
        }>;
      },
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
      {
        dailySales: Array<{
          date: string;
          revenue: number;
          orders: number;
        }>;
        monthlySales: Array<{
          month: string;
          revenue: number;
          orders: number;
        }>;
        topCategories: Array<{
          category: string;
          revenue: number;
          orders: number;
        }>;
      },
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
    getInventoryAlerts: builder.query<
      {
        lowStockProducts: Array<{
          _id: string;
          name: string;
          currentStock: number;
          minStock: number;
          warehouse: string;
        }>;
        outOfStockProducts: Array<{
          _id: string;
          name: string;
          warehouse: string;
        }>;
        expiringProducts: Array<{
          _id: string;
          name: string;
          expiryDate: string;
          quantity: number;
        }>;
      },
      void
    >({
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