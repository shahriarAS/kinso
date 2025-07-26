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
  productId?: string;
  locationId?: string;
  locationType?: "Warehouse" | "Outlet";
  mrp?: number;
  tp?: number;
  expireDate?: string;
  quantity?: number;
  batchNumber?: string;
}

export interface StockFilters {
  page?: number;
  limit?: number;
  locationId?: string;
  locationType?: "Warehouse" | "Outlet";
  productId?: string;
  batchNumber?: string;
  minQuantity?: number;
  maxQuantity?: number;
  minExpireDate?: string;
  maxExpireDate?: string;
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
    locationId: string;
    locationType: "Warehouse" | "Outlet";
    itemCount: number;
    totalValue: number;
  }>;
  stockByProduct: Array<{
    productId: string;
    productName: string;
    totalQuantity: number;
    totalValue: number;
  }>;
}

export interface StockMovement {
  _id: string;
  stockId: string;
  fromLocation?: string;
  toLocation: string;
  quantity: number;
  movementType: "IN" | "OUT" | "TRANSFER";
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface StockMovementInput {
  stockId: string;
  fromLocation?: string;
  toLocation: string;
  quantity: number;
  movementType: "IN" | "OUT" | "TRANSFER";
  reason: string;
} 