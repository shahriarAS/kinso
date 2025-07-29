import { Product } from "../products";
import { Warehouse } from "../warehouses";
import { Outlet } from "../outlets";

export interface Demand {
  _id: string;
  location: string | Warehouse | Outlet;
  locationType: "Warehouse" | "Outlet";
  products: {
    product: Product;
    quantity: number;
  }[];
  status: "Pending" | "Approved" | "ConvertedToStock";
  createdAt: string;
  updatedAt: string;
  // Optional field to track which products were actually converted
  convertedProductIds?: string[];
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
  products: Array<{
    productId: string;
    quantity: number;
    mrp: number;
    tp: number;
    expireDate: string;
    batchNumber: string;
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

export interface DemandConversionResponse {
  demand: Demand;
  stockEntries: any[]; // You can import Stock type if needed
}