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
              ...result.data.map(({ _id }) => ({ type: "Order" as const, id: _id })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

    // Get single order by ID
    getOrder: builder.query<
      { data: Order },
      string
    >({
      query: (_id) => ({
        url: `/${_id}`,
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
      query: ({ _id, order }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: order,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Order", id: _id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Delete order
    deleteOrder: builder.mutation<
      { message: string },
      string
    >({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
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
          ? result.data.map(({ _id }) => ({ type: "Order" as const, id: _id }))
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
  useGetOrderStatsQuery,
  useGetOrdersByCustomerQuery,
} = ordersApi; 