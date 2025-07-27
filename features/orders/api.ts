import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Order, OrderInput } from "./types";
import { PaginatedResponse, ApiResponse } from "@/types";

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: baseQueryWithErrorHandling("/api/orders"),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    // Get all orders with pagination and filters
    getOrders: builder.query<
      PaginatedResponse<Order>,
      {
        page?: number;
        limit?: number;
        customer?: string;
        status?: string;
        search?: string;
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
    createOrder: builder.mutation<
      ApiResponse<Order>,
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

    // Get orders by customer
    getOrdersByCustomer: builder.query<
      ApiResponse<Order[]>,
      { customerId: string; limit?: number }
    >({
      query: ({ customerId, limit = 10 }) => ({
        url: `/customer/${customerId}`,
        method: "GET",
        params: { limit },
      }),
      providesTags: [{ type: "Order", id: "CUSTOMER" }],
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
  useGetOrdersByCustomerQuery,
} = ordersApi; 