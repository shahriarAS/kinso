import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Brand, BrandInput, BrandUpdateInput } from "./types";

export const brandsApi = createApi({
  reducerPath: "brandsApi",
  baseQuery: baseQueryWithErrorHandling("/api/brands"),
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    getBrands: builder.query<
      {
        success: boolean;
        data: Brand[];
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
        brandId?: string;
        brandName?: string;
        vendorId?: string;
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
                type: "Brand" as const,
                _id,
              })),
              { type: "Brand", id: "LIST" },
            ]
          : [{ type: "Brand", id: "LIST" }],
    }),

    getBrand: builder.query<{ success: boolean; data: Brand }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Brand", id }],
    }),

    createBrand: builder.mutation<
      { success: boolean; message: string; data: Brand },
      BrandInput
    >({
      query: (brand) => ({
        url: "/",
        method: "POST",
        body: brand,
      }),
      invalidatesTags: [{ type: "Brand", id: "LIST" }],
    }),

    updateBrand: builder.mutation<
      { success: boolean; message: string; data: Brand },
      { _id: string; brand: Partial<BrandUpdateInput> }
    >({
      query: ({ _id, brand }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: brand,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Brand", _id },
        { type: "Brand", id: "LIST" },
      ],
    }),

    deleteBrand: builder.mutation<{ success: boolean; message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Brand", id: "LIST" }],
    }),

    getAllBrands: builder.query<{ success: boolean; data: Brand[] }, void>({
      query: () => ({
        url: "/",
        method: "GET",
        params: { limit: 1000 }, // Get all brands
      }),
      providesTags: ["Brand"],
    }),

    getBrandsByVendor: builder.query<{ success: boolean; data: Brand[] }, string>({
      query: (vendorId) => ({
        url: "/",
        method: "GET",
        params: { vendorId, limit: 1000 },
      }),
      providesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetAllBrandsQuery,
  useGetBrandsByVendorQuery,
} = brandsApi; 