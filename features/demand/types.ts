import { Product } from "../products";

export interface Demand {
  _id: string;
  location: string;
  locationType: "Warehouse" | "Outlet";
  products: {
    product: Product;
    quantity: number;
  }[];
  status: "Pending" | "Approved" | "ConvertedToStock";
  createdAt: string;
  updatedAt: string;
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