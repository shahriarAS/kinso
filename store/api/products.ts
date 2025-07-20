import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "../baseQueryWithErrorHandling";
import { Product, ProductInput } from "@/types";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: baseQueryWithErrorHandling("/api/products"),
  tagTypes: ["Product", "Category"],
  endpoints: (builder) => ({
    // Get all products with pagination and filters
    getProducts: builder.query<
      {
        data: Product[];
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
        category?: string;
        warehouse?: string;
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
                type: "Product" as const,
                _id,
              })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),

    // Get single product by ID
    getProduct: builder.query<{ data: Product }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Create new product
    createProduct: builder.mutation<
      { message: string; data: Product },
      ProductInput
    >({
      query: (product) => ({
        url: "/",
        method: "POST",
        body: product,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // Update product
    updateProduct: builder.mutation<
      { message: string; data: Product },
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
    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    // Update product stock
    updateProductStock: builder.mutation<
      { message: string; data: Product },
      {
        productId: string;
        warehouseId: string;
        quantity: number;
        operation: "add" | "subtract" | "set";
      }
    >({
      query: ({ productId, warehouseId, quantity, operation }) => ({
        url: `/${productId}/stock`,
        method: "PATCH",
        body: { warehouseId, quantity, operation },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductStockMutation,
} = productsApi;
