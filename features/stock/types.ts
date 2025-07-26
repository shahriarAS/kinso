import { IStock } from "./model";

export interface Stock extends IStock {
  _id: string;
}

export interface StockInput {
  stockId: string;
  productId: string;
  locationId: string;
  locationType: "Warehouse" | "Outlet";
  mrp: number;
  tp: number;
  expireDate: string;
  quantity: number;
  batchNumber: string;
}

export interface StockUpdateInput {
  productId: string;
  locationId: string;
  locationType: "Warehouse" | "Outlet";
  mrp: number;
  tp: number;
  expireDate: string;
  quantity: number;
  batchNumber: string;
}

export interface StockFilters {
  page?: number;
  limit?: number;
  locationId?: string;
  locationType?: "Warehouse" | "Outlet";
  productId?: string;
}

export interface StockApiResponse {
  success: boolean;
  message?: string;
  data?: Stock | Stock[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
} 