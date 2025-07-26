import { IDemand } from "./model";

export interface Demand extends Omit<IDemand, "_id"> {
  _id: string;
}

export interface DemandInput {
  demandId: string;
  locationId: string;
  locationType: "Warehouse" | "Outlet";
  products: {
    productId: string;
    quantity: number;
  }[];
  status: "Pending" | "Approved" | "ConvertedToStock";
}

export interface DemandFilters {
  page?: number;
  limit?: number;
  locationId?: string;
  locationType?: "Warehouse" | "Outlet";
  status?: "Pending" | "Approved" | "ConvertedToStock";
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