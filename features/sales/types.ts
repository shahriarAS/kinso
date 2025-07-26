import { Customer } from "@/features/customers";
import { Outlet } from "@/features/outlets";
import { User } from "@/features/users";
import { Stock } from "@/features/stock";

export interface SaleItem {
  stockId: string;
  quantity: number;
  unitPrice: number;
  discountApplied: number;
}

export interface Sale {
  _id: string;
  saleId: string;
  outletId: string | Outlet;
  customerId?: string | Customer;
  saleDate: string;
  totalAmount: number;
  items: SaleItem[];
  paymentMethod: "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD";
  discountAmount: number;
  notes?: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleRequest {
  outletId: string;
  customerId?: string;
  items: SaleItem[];
  paymentMethod: "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD";
  discountAmount: number;
  notes?: string;
}

export interface SaleUpdateRequest {
  saleId: string;
  customerId?: string;
  items?: SaleItem[];
  paymentMethod?: "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD";
  discountAmount?: number;
  notes?: string;
}

export interface SaleReturnRequest {
  saleId: string;
  items: {
    stockId: string;
    quantity: number;
    reason: string;
  }[];
  notes?: string;
}

export interface SalesHistoryFilters {
  outletId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD";
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface SalesHistoryResponse {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CartItem {
  stockId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountApplied: number;
  totalPrice: number;
  availableStock: number;
}

export interface ProductSearchResult {
  _id: string;
  name: string;
  barcode: string;
  sku: string;
  stock: {
    _id: string;
    units: number;
    mrp: number;
    tp: number;
    expireDate: string;
  }[];
}

export interface SaleResponse {
  success: boolean;
  data?: Sale;
  message?: string;
}

export interface SalesResponse {
  success: boolean;
  data?: Sale[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface SaleStats {
  totalSales: number;
  totalRevenue: number;
  averageSaleValue: number;
  salesByOutlet: Array<{
    outletId: string;
    outletName: string;
    saleCount: number;
    totalRevenue: number;
  }>;
  salesByPaymentMethod: Array<{
    method: "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD";
    count: number;
    totalAmount: number;
  }>;
  salesByDate: Array<{
    date: string;
    saleCount: number;
    totalRevenue: number;
  }>;
}

export interface SaleReturn {
  _id: string;
  saleId: string;
  items: Array<{
    stockId: string;
    quantity: number;
    reason: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 