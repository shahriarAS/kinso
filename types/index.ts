// Common enums
export type PaymentMethod = "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD";

export type UserRole = "admin" | "manager" | "staff";

export type OutletType = "Micro Outlet" | "Super Shop";

export type LocationType = "Warehouse" | "Outlet";

// Standard response structures
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListResponse<T = any> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
}

// Common filter interfaces
export interface BaseFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Common input interfaces
export interface BaseInput {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Common update interfaces
export interface BaseUpdateInput {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}