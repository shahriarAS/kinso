import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "../baseQueryWithErrorHandling";
import { Order, OrderInput } from "@/types";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithErrorHandling("/api/orders"),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    // Get all orders with pagination and filters
    getOrders: builder.query<
      {
        data: Order[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
        paymentStatus?: "pending" | "paid" | "failed";
        customerId?: string;
        startDate?: string;
        endDate?: string;
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
              ...result.data.map(({ id }) => ({ type: "Order" as const, id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

    // Get single order by ID
    getOrder: builder.query<
      { data: Order },
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // Create new order
    createOrder: builder.mutation<
      { message: string; data: Order },
      OrderInput
    >({
      query: (order) => ({
        url: "/",
        method: "POST",
        body: order,
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),

    // Update order
    updateOrder: builder.mutation<
      { message: string; data: Order },
      { _id: string; order: Partial<OrderInput> }
    >({
      query: ({ id, order }) => ({
        url: `/${id}`,
        method: "PUT",
        body: order,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Delete order
    deleteOrder: builder.mutation<
      { message: string },
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<
      { message: string; data: Order },
      { _id: string; status: Order["status"] }
    >({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Update payment status
    updatePaymentStatus: builder.mutation<
      { message: string; data: Order },
      { _id: string; paymentStatus: Order["paymentStatus"] }
    >({
      query: ({ id, paymentStatus }) => ({
        url: `/${id}/payment-status`,
        method: "PATCH",
        body: { paymentStatus },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Get order statistics
    getOrderStats: builder.query<
      {
        totalOrders: number;
        totalRevenue: number;
        pendingOrders: number;
        processingOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        averageOrderValue: number;
        recentOrders: Order[];
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
      providesTags: ["Order"],
    }),

    // Get orders by customer
    getOrdersByCustomer: builder.query<
      { data: Order[] },
      string
    >({
      query: (customerId) => ({
        url: `/customer/${customerId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? result.data.map(({ id }) => ({ type: "Order" as const, id }))
          : [],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdatePaymentStatusMutation,
  useGetOrderStatsQuery,
  useGetOrdersByCustomerQuery,
} = ordersApi; 