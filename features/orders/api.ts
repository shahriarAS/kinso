import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Order, OrderInput } from "@/features/orders/types";
import { PaginatedResponse, ApiResponse } from "@/types";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithErrorHandling("/api/orders"),
  tagTypes: ["Order", "Product"],
  endpoints: (builder) => ({
    // Get all orders with pagination and filters
    getOrders: builder.query<
      PaginatedResponse<Order>,
      {
        page?: number;
        limit?: number;
        search?: string;
        paymentMethod?: string;
        warehouse?: string;
        product?: string;
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
                type: "Order" as const,
                _id,
              })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],
    }),

    // Get single order by ID
    getOrder: builder.query<ApiResponse<Order>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // Create new order
    createOrder: builder.mutation<ApiResponse<Order>, OrderInput>(
      {
        query: (order) => ({
          url: "/",
          method: "POST",
          body: order,
        }),
        invalidatesTags: [
          { type: "Order", id: "LIST" },
          { type: "Product", id: "LIST" }, // Invalidate products list cache after order creation
        ],
      },
    ),

    // Update order
    updateOrder: builder.mutation<
      ApiResponse<Order>,
      { _id: string; order: Partial<OrderInput> }
    >({
      query: ({ _id, order }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: order,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Order", _id },
        { type: "Order", id: "LIST" },
      ],
    }),

    // Delete order
    deleteOrder: builder.mutation<ApiResponse<void>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Order", id: "LIST" }],
    }),

    // Get order statistics
    getOrderStats: builder.query<
      ApiResponse<{
        totalOrders: number;
        totalRevenue: number;
        pendingOrders: number;
        processingOrders: number;
        shippedOrders: number;
        deliveredOrders: number;
        cancelledOrders: number;
        averageOrderValue: number;
        recentOrders: Order[];
      }>,
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
    getOrdersByCustomer: builder.query<ApiResponse<Order[]>, string>({
      query: (customerId) => ({
        url: `/customer/${customerId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? result.data.map(({ _id }) => ({ type: "Order" as const, _id }))
          : [],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useLazyGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetOrderStatsQuery,
  useGetOrdersByCustomerQuery,
} = ordersApi;
