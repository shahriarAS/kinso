import { IDemand } from "./model";

export interface Demand extends Omit<IDemand, "_id"> {
  _id: string;
}

export interface DemandInput {
  location: string;
  locationType: "Warehouse" | "Outlet";
  products: {
    product: string;
    quantity: number;
  }[];
  status: "Pending" | "Approved" | "ConvertedToStock";
}

export interface DemandUpdateInput {
  location?: string;
  locationType?: "Warehouse" | "Outlet";
  products?: {
    product: string;
    quantity: number;
  }[];
  status?: "Pending" | "Approved" | "ConvertedToStock";
}

export interface DemandFiltersTypes {
  page?: number;
  limit?: number;
  location?: string;
  locationType?: "Warehouse" | "Outlet";
  status?: "Pending" | "Approved" | "ConvertedToStock";
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DemandConversionRequest {
  mrp: number;
  tp: number;
  expireDate: string;
  batchNumber: string;
}

export interface DemandResponse {
  data: Demand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface DemandApiResponse {
  success: boolean;
  data?: Demand | Demand[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface DemandStats {
  totalDemands: number;
  pendingDemands: number;
  approvedDemands: number;
  convertedDemands: number;
  demandsByLocation: Array<{
    location: string;
    locationType: "Warehouse" | "Outlet";
    demandCount: number;
    totalQuantity: number;
  }>;
  demandsByStatus: Array<{
    status: "Pending" | "Approved" | "ConvertedToStock";
    count: number;
  }>;
}

export interface DemandGenerationRequest {
  location: string;
  locationType: "Warehouse" | "Outlet";
  products: Array<{
    product: string;
    currentStock: number;
    minStock: number;
    suggestedQuantity: number;
  }>;
} 