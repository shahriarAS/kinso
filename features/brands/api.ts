import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Brand, BrandInput, BrandUpdateInput } from "./types";
import { PaginatedResponse, ApiResponse } from "@/types";

export const brandsApi = createApi({
  reducerPath: "brandsApi",
  baseQuery: baseQueryWithErrorHandling("/api/brands"),
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    getBrands: builder.query<
      PaginatedResponse<Brand>,
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
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Brand" as const,
                _id,
              })),
              { type: "Brand", id: "LIST" },
            ]
          : [{ type: "Brand", id: "LIST" }],
    }),

    getBrand: builder.query<ApiResponse<Brand>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Brand", id }],
    }),

    createBrand: builder.mutation<
      ApiResponse<Brand>,
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
      ApiResponse<Brand>,
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

    deleteBrand: builder.mutation<ApiResponse<void>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Brand", id: "LIST" }],
    }),

    getAllBrands: builder.query<ApiResponse<Brand[]>, void>({
      query: () => ({
        url: "/",
        method: "GET",
        params: { limit: 1000 }, // Get all brands
      }),
      providesTags: ["Brand"],
    }),

    getBrandsByVendor: builder.query<ApiResponse<Brand[]>, string>({
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