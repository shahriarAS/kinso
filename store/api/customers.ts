import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "../baseQueryWithErrorHandling";
import { Customer, CustomerInput } from "@/types";

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: baseQueryWithErrorHandling("/api/customers"),
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    // Get all customers with pagination and filters
    getCustomers: builder.query<
      {
        data: Customer[];
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
        status?: "active" | "inactive";
        email?: string;
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
              ...result.data.map(({ _id }) => ({ type: "Customer" as const, _id })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),

    // Get single customer by ID
    getCustomer: builder.query<
      { data: Customer },
      string
    >({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Customer", id }],
    }),

    // Create new customer
    createCustomer: builder.mutation<
      { message: string; data: Customer },
      CustomerInput
    >({
      query: (customer) => ({
        url: "/",
        method: "POST",
        body: customer,
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),

    // Update customer
    updateCustomer: builder.mutation<
      { message: string; customer: Customer },
      { _id: string; customer: Partial<CustomerInput> }
    >({
      query: ({ _id, customer }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: customer,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Customer", _id },
        { type: "Customer", id: "LIST" },
      ],
    }),

    // Delete customer
    deleteCustomer: builder.mutation<
      { message: string },
      string
    >({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),

    // Get customer statistics
    getCustomerStats: builder.query<
      {
        totalCustomers: number;
        activeCustomers: number;
        inactiveCustomers: number;
        averageOrdersPerCustomer: number;
        topCustomers: Array<{
          _id: string;
          name: string;
          totalOrders: number;
          totalSpent: number;
        }>;
      },
      void
    >({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      providesTags: ["Customer"],
    }),

    // Search customers by name or email
    searchCustomers: builder.query<
      { customers: Customer[] },
      string
    >({
      query: (searchTerm) => ({
        url: "/search",
        method: "GET",
        params: { q: searchTerm },
      }),
      providesTags: (result) =>
        result
          ? result.customers.map(({ _id }) => ({ type: "Customer" as const, _id }))
          : [],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerStatsQuery,
  useSearchCustomersQuery,
} = customersApi; 