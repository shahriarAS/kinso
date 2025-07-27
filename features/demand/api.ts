import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import {
  Demand,
  DemandInput,
  DemandFiltersTypes,
  DemandResponse,
  DemandGenerationRequest,
  DemandConversionRequest,
} from "./types";

export const demandApi = createApi({
  reducerPath: "demandApi",
  baseQuery: baseQueryWithErrorHandling("/api/demands"),
  tagTypes: ["Demand"],
  endpoints: (builder) => ({
    // Get all demands with pagination and filters
    getDemands: builder.query<DemandResponse, DemandFiltersTypes>({
      query: (filters) => ({
        url: "/",
        method: "GET",
        params: filters,
      }),
      providesTags: (result) =>
        result
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
    getDemand: builder.query<{ success: boolean; data: Demand }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Demand", id }],
    }),

    // Create new demand
    createDemand: builder.mutation<
      { success: boolean; message: string; data: Demand },
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
      { success: boolean; message: string; data: Demand },
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
    deleteDemand: builder.mutation<{ success: boolean; message: string }, string>({
      query: (_id) => ({
        url: `/${_id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Demand", id: "LIST" }],
    }),

    // Generate demands based on sales data
    generateDemands: builder.mutation<
      { success: boolean; message: string; data: Demand[] },
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
      { success: boolean; message: string; data: Demand },
      { demandId: string; conversionData: DemandConversionRequest }
    >({
      query: ({ demandId, conversionData }) => ({
        url: `/convert/${demandId}`,
        method: "POST",
        body: conversionData,
      }),
      invalidatesTags: (result, error, { demandId }) => [
        { type: "Demand", id: demandId },
        { type: "Demand", id: "LIST" },
      ],
    }),

    // Update demand status
    updateDemandStatus: builder.mutation<
      { success: boolean; message: string; data: Demand },
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