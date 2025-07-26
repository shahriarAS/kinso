import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Customer, CustomerInput } from "./types";

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
        membershipStatus?: boolean;
        customerName?: string;
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
              ...result.data.map(({ _id }) => ({
                type: "Customer" as const,
                _id,
              })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),

    // Get single customer by ID
    getCustomer: builder.query<{ data: Customer }, string>({
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
    deleteCustomer: builder.mutation<{ message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),

    // Update membership status
    updateMembership: builder.mutation<
      { message: string; customer: Customer },
      { _id: string; membershipStatus: boolean }
    >({
      query: ({ _id, membershipStatus }) => ({
        url: `/membership/update/${_id}`,
        method: "PUT",
        body: { membershipStatus },
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Customer", _id },
        { type: "Customer", id: "LIST" },
      ],
    }),

    // Auto-activate membership based on purchase threshold
    autoActivateMembership: builder.mutation<
      { message: string; updatedCount: number },
      { threshold?: number }
    >({
      query: ({ threshold = 1000 }) => ({
        url: "/membership/auto-activate",
        method: "POST",
        body: { threshold },
      }),
      invalidatesTags: [{ type: "Customer", id: "LIST" }],
    }),

    // Get customer statistics
    getCustomerStats: builder.query<
      {
        totalCustomers: number;
        members: number;
        nonMembers: number;
        newCustomersThisMonth: number;
        averagePurchaseAmount: number;
        totalPurchaseAmount: number;
      },
      void
    >({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Customer", id: "STATS" }],
    }),

    // Get customers by membership status
    getCustomersByMembership: builder.query<
      { data: Customer[] },
      { membershipStatus: boolean; limit?: number }
    >({
      query: ({ membershipStatus, limit = 10 }) => ({
        url: `/membership/by-status/${membershipStatus}`,
        method: "GET",
        params: { limit },
      }),
      providesTags: [{ type: "Customer", id: "MEMBERSHIP" }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useUpdateMembershipMutation,
  useAutoActivateMembershipMutation,
  useGetCustomerStatsQuery,
  useGetCustomersByMembershipQuery,
} = customersApi;
