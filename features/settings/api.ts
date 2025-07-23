import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithErrorHandling from "@/store/baseQueryWithErrorHandling";
import { Settings } from "./types";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: baseQueryWithErrorHandling("/api/settings"),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query<{ data: Settings }, void>({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<{ data: Settings }, Partial<Settings>>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
