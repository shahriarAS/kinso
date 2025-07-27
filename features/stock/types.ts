import { IStock } from "./model";

export interface Stock extends IStock {
  _id: string;
}

export interface StockInput {
  product: string;
  location: string;
  locationType: string;
  mrp: number;
  tp: number;
  expireDate: Date;
  unit: number;
  batchNumber: string;
}

export interface StockUpdateInput {
  product?: string;
  location?: string;
  locationType?: string;
  mrp?: number;
  tp?: number;
  expireDate?: Date;
  unit?: number;
  batchNumber?: string;
}

export interface StockFilters {
  page?: number;
  limit?: number;
  location?: string;
  locationType?: "Warehouse" | "Outlet";
  product?: string;
  batchNumber?: string;
  minUnit?: number;
  maxUnit?: number;
  minExpireDate?: Date;
  maxExpireDate?: Date;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

export interface StockResponse {
  success: boolean;
  data?: Stock;
  message?: string;
}

export interface StocksResponse {
  success: boolean;
  data?: Stock[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface StockStats {
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItems: number;
  stockByLocation: Array<{
    location: string;
    locationType: "Warehouse" | "Outlet";
    itemCount: number;
    totalValue: number;
  }>;
  stockByProduct: Array<{
    product: string;
    productName: string;
    totalUnit: number;
    totalValue: number;
  }>;
}

export interface StockStatsResponse {
  success: boolean;
  data: StockStats;
  message?: string;
}

export interface StockMovement {
  _id: string;
  stock: string;
  fromLocation?: string;
  toLocation: string;
  unit: number;
  movementType: "IN" | "OUT" | "TRANSFER";
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface StockMovementInput {
  stock: string;
  fromLocation?: string;
  toLocation: string;
  unit: number;
  movementType: "IN" | "OUT" | "TRANSFER";
  reason: string;
} 