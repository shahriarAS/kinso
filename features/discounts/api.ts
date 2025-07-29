import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Discount, DiscountInput, DiscountUpdateInput } from "./types";

export const discountsApi = createApi({
  reducerPath: "discountsApi",
  baseQuery: baseQueryWithErrorHandling("/api/discounts"),
  tagTypes: ["Discount"],
  endpoints: (builder) => ({
    // Get all discounts with pagination and filters
    getDiscounts: builder.query<
      {
        success: boolean;
        data: Discount[];
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
        discountType?: string;
        isActive?: boolean;
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
                type: "Discount" as const,
                _id,
              })),
              { type: "Discount", id: "LIST" },
            ]
          : [{ type: "Discount", id: "LIST" }],
    }),

    // Get single discount by ID
    getDiscount: builder.query<{ success: boolean; data: Discount }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Discount", id }],
    }),

    // Create new discount
    createDiscount: builder.mutation<
      { success: boolean; message: string; data: Discount },
      DiscountInput
    >({
      query: (discount) => ({
        url: "/",
        method: "POST",
        body: discount,
      }),
      invalidatesTags: [{ type: "Discount", id: "LIST" }],
    }),

    // Update discount
    updateDiscount: builder.mutation<
      { success: boolean; message: string; data: Discount },
      { _id: string; discount: Partial<DiscountUpdateInput> }
    >({
      query: ({ _id, discount }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: discount,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Discount", _id },
        { type: "Discount", id: "LIST" },
      ],
    }),

    // Delete discount
    deleteDiscount: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Discount", id: "LIST" }],
    }),

    // Get all active discounts
    getActiveDiscounts: builder.query<
      { success: boolean; data: Discount[] },
      void
    >({
      query: () => ({
        url: "/",
        method: "GET",
        params: { isActive: true, limit: 1000 },
      }),
      providesTags: ["Discount"],
    }),
  }),
});

export const {
  useGetDiscountsQuery,
  useGetDiscountQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetActiveDiscountsQuery,
} = discountsApi;
