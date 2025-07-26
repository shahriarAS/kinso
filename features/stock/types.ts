import { IStock } from "./model";

export interface Stock extends IStock {
  _id: string;
  product?: {
    _id: string;
    name: string;
    barcode: string;
  };
  outlet?: {
    _id: string;
    name: string;
    outletId: string;
  };
  warehouse?: {
    _id: string;
    name: string;
    warehouseId: string;
  };
}

export interface StockInput {
  productId: string;
  outletId?: string;
  warehouseId?: string;
  mrp: number;
  tp: number;
  expireDate: string;
  units: number;
  entryDate?: string;
}

export interface StockMoveInput {
  stockId: string;
  targetOutletId?: string;
  targetWarehouseId?: string;
  units: number;
}

export interface StockFilters {
  productId?: string;
  outletId?: string;
  warehouseId?: string;
  search?: string;
  expireDateFrom?: string;
  expireDateTo?: string;
  entryDateFrom?: string;
  entryDateTo?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
}

export interface StockStats {
  totalStock: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  stockByLocation: {
    warehouse: { [key: string]: number };
    outlet: { [key: string]: number };
  };
}

export interface StockApiResponse {
  success: boolean;
  message: string;
  data?: Stock | Stock[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 