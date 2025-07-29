import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import {
  Demand,
  DemandConversionRequest,
  DemandFiltersTypes,
  DemandGenerationRequest,
  DemandInput
} from "./types";
import { ApiResponse, PaginatedResponse } from "@/types";

export const demandApi = createApi({
  reducerPath: "demandApi",
  baseQuery: baseQueryWithErrorHandling("/api/demands"),
  tagTypes: ["Demand"],
  endpoints: (builder) => ({
    // Get all demands with pagination and filters
    getDemands: builder.query<PaginatedResponse<Demand>, DemandFiltersTypes>({
      query: (filters) => ({
        url: "/",
        method: "GET",
        params: filters,
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ _id }) => ({
              type: "Demand" as const,
              _id,
            })),
            { type: "Demand", id: "LIST" },
          ]
          : [{ type: "Demand", id: "LIST" }],
    }),

    // Get single demand by ID
    getDemand: builder.query<ApiResponse<Demand>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Demand", id }],
    }),

    // Create new demand
    createDemand: builder.mutation<
      ApiResponse<Demand>,
      DemandInput
    >({
      query: (demand) => ({
        url: "/",
        method: "POST",
        body: demand,
      }),
      invalidatesTags: [{ type: "Demand", id: "LIST" }],
    }),

    // Update demand
    updateDemand: builder.mutation<
      ApiResponse<Demand>,
      { _id: string; demand: Partial<DemandInput> }
    >({
      query: ({ _id, demand }) => ({
        url: `/${_id}`,
        method: "PUT",
        body: demand,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Demand", _id },
        { type: "Demand", id: "LIST" },
      ],
    }),

    // Delete demand
    deleteDemand: builder.mutation<ApiResponse<void>, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Demand", id: "LIST" }],
    }),

    // Generate demands based on sales data
    generateDemands: builder.mutation<
      ApiResponse<Demand[]>,
      DemandGenerationRequest
    >({
      query: (request) => ({
        url: "/generate",
        method: "POST",
        body: request,
      }),
      invalidatesTags: [{ type: "Demand", id: "LIST" }],
    }),

    // Convert demand to stock
    convertDemandToStock: builder.mutation<
      ApiResponse<Demand>,
      { demand: string; conversionData: DemandConversionRequest }
    >({
      query: ({ demand, conversionData }) => ({
        url: `/convert/${demand}`,
        method: "POST",
        body: conversionData,
      }),
      invalidatesTags: (result, error, { demand }) => [
        { type: "Demand", id: demand },
        { type: "Demand", id: "LIST" },
      ],
    }),

    // Update demand status
    updateDemandStatus: builder.mutation<
      ApiResponse<Demand>,
      { _id: string; status: "pending" | "approved" | "converted" | "cancelled" }
    >({
      query: ({ _id, status }) => ({
        url: `/${_id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Demand", _id },
        { type: "Demand", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetDemandsQuery,
  useGetDemandQuery,
  useCreateDemandMutation,
  useUpdateDemandMutation,
  useDeleteDemandMutation,
  useGenerateDemandsMutation,
  useConvertDemandToStockMutation,
  useUpdateDemandStatusMutation,
} = demandApi; 