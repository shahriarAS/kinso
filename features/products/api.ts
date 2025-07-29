import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Product, ProductInput } from "@/features/products/types";
import { PaginatedResponse, ApiResponse } from "@/types";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: baseQueryWithErrorHandling("/api/products"),
  tagTypes: ["Product", "Category"],
  endpoints: (builder) => ({
    // Get all products with pagination and filters
    getProducts: builder.query<
      PaginatedResponse<Product>,
      {
        page?: number;
        limit?: number;
        search?: string;
        barcode?: string;
        vendor?: string;
        brand?: string;
        category?: string;
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
                type: "Product" as const,
                _id,
              })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    // Get single product by ID
    getProduct: builder.query<ApiResponse<Product>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Create new product
    createProduct: builder.mutation<ApiResponse<Product>, ProductInput>({
      query: (product) => ({
        url: "/",
        method: "POST",
        body: product,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // Update product
    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { _id: string; product: Partial<ProductInput> }
    >({
      query: ({ _id, product }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: product,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Product", _id },
        { type: "Product", id: "LIST" },
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation<ApiResponse<void>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
