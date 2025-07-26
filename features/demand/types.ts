import { IDemand } from "./model";

export interface Demand extends Omit<IDemand, "_id" | "outletId" | "productId"> {
  _id: string;
  outletId?: string;
  productId: string;
}

export interface DemandInput {
  outletId?: string;
  warehouseId?: string;
  productId: string;
  quantity: number;
  demandDate?: Date;
}

export interface DemandFilters {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
  warehouseId?: string;
  productId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DemandGenerationRequest {
  outletId?: string;
  warehouseId?: string;
  days?: number; // Number of days to look back for sales data
  minSalesThreshold?: number; // Minimum sales to consider for demand generation
}

export interface DemandConversionRequest {
  demandId: string;
  warehouseId: string;
  quantity: number;
}

export interface DemandResponse {
  data: Demand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DemandGenerationResponse {
  message: string;
  generatedCount: number;
  demands: Demand[];
} 