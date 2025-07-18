import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

// Define the error type
interface ErrorResponse {
  status: number;
  data: {
    message: string;
  };
}

// Create a base query with dynamic baseUrl
const baseQueryWithErrorHandling = (baseUrl: string): BaseQueryFn => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders(headers) {
      return headers;
    },
    credentials: "include",
  });

  return async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    // Global error transformation logic
    if (result.error) {
      const transformedError = {
        status: result.error.status,
        data: {
          message:
            (result.error.data as any)?.message || "Unknown error occurred",
        },
      } as ErrorResponse;

      return {
        ...result,
        error: transformedError,
      };
    }

    return result;
  };
};

export default baseQueryWithErrorHandling;
