import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import {
  Vendor,
  ICreateVendorRequest,
  IUpdateVendorRequest,
  IVendorFilters,
  IVendorResponse,
  IVendorsResponse,
} from "./types";

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: baseQueryWithErrorHandling("/api/vendors"),
  tagTypes: ["Vendor"],
  endpoints: (builder) => ({
    getVendors: builder.query<
      {
        data: Vendor[];
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
        vendorId?: string;
        vendorName?: string;
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
                type: "Vendor" as const,
                _id,
              })),
              { type: "Vendor", id: "LIST" },
            ]
          : [{ type: "Vendor", id: "LIST" }],
    }),

    getVendor: builder.query<{ data: Vendor }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Vendor", id }],
    }),

    createVendor: builder.mutation<
      { message: string; data: Vendor },
      ICreateVendorRequest
    >({
      query: (vendor) => ({
        url: "/",
        method: "POST",
        body: vendor,
      }),
      invalidatesTags: [{ type: "Vendor", id: "LIST" }],
    }),

    updateVendor: builder.mutation<
      { message: string; data: Vendor },
      { _id: string; vendor: Partial<IUpdateVendorRequest> }
    >({
      query: ({ _id, vendor }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: vendor,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Vendor", _id },
        { type: "Vendor", id: "LIST" },
      ],
    }),

    deleteVendor: builder.mutation<{ message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Vendor", id: "LIST" }],
    }),

    getAllVendors: builder.query<{ data: Vendor[] }, void>({
      query: () => ({
        url: "/",
        method: "GET",
        params: { limit: 1000 }, // Get all vendors
      }),
      providesTags: ["Vendor"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useGetAllVendorsQuery,
} = vendorApi; 