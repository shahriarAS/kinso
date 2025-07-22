import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Category, CategoryInput } from "@/features/categories/types";

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: baseQueryWithErrorHandling("/api/categories"),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    // Get all categories with pagination and search
    getCategories: builder.query<
      {
        data: Category[];
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
                type: "Category" as const,
                _id,
              })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),

    // Get single category by ID
    getCategory: builder.query<{ data: Category }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    // Create new category
    createCategory: builder.mutation<
      { message: string; data: Category },
      CategoryInput
    >({
      query: (category) => ({
        url: "/",
        method: "POST",
        body: category,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    // Update category
    updateCategory: builder.mutation<
      { message: string; data: Category },
      { _id: string; category: Partial<CategoryInput> }
    >({
      query: ({ _id, category }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: category,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Category", _id },
        { type: "Category", id: "LIST" },
      ],
    }),

    // Delete category
    deleteCategory: builder.mutation<{ message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    // Get all categories for dropdown/select
    getAllCategories: builder.query<{ data: Category[] }, void>({
      query: () => ({
        url: "/",
        method: "GET",
        params: { limit: 1000 }, // Get all categories
      }),
      providesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoriesQuery,
} = categoriesApi;
