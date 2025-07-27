import { NextResponse } from "next/server";
import { ApiResponse, PaginatedResponse } from "@/types";

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

export function createErrorResponse(
  message: string,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination,
    ...(message && { message }),
  });
}

export function createNotFoundResponse(resource: string): NextResponse<ApiResponse<never>> {
  return createErrorResponse(`${resource} not found`, 404);
}

export function createValidationErrorResponse(message: string): NextResponse<ApiResponse<never>> {
  return createErrorResponse(message, 400);
}

export function createConflictErrorResponse(message: string): NextResponse<ApiResponse<never>> {
  return createErrorResponse(message, 409);
}

export function createUnauthorizedResponse(message: string = "Unauthorized"): NextResponse<ApiResponse<never>> {
  return createErrorResponse(message, 401);
}

export function createForbiddenResponse(message: string = "Forbidden"): NextResponse<ApiResponse<never>> {
  return createErrorResponse(message, 403);
} 