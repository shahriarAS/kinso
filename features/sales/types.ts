import { Customer } from "@/features/customers";
import { Outlet } from "@/features/outlets";
import { User } from "@/features/users";
import { Stock } from "@/features/stock";
import { PaymentMethod } from "@/types";

export interface SaleItem {
  stock: string;
  quantity: number;
  unitPrice: number;
  discountApplied: number;
}

export interface Sale {
  _id: string;
  saleId: string;
  outlet: string;
  customer?: string;
  saleDate: string;
  totalAmount: number;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  discountAmount: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleRequest {
  outlet: string;
  customer?: string;
  items: SaleItem[];
  paymentMethod: PaymentMethod;
  discountAmount: number;
  notes?: string;
}

export interface SaleUpdateRequest {
  saleId: string;
  customer?: string;
  items?: SaleItem[];
  paymentMethod?: PaymentMethod;
  discountAmount?: number;
  notes?: string;
}

export interface SaleReturnRequest {
  saleId: string;
  items: {
    stock: string;
    quantity: number;
    reason: string;
  }[];
  notes?: string;
}

export interface SalesHistoryFilters {
  outlet?: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
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
  stock: string;
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
    outlet: string;
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

export interface SalesStatsResponse {
  success: boolean;
  data: SaleStats;
  message?: string;
}

export interface SaleReturn {
  _id: string;
  saleId: string;
  items: Array<{
    stock: string;
    quantity: number;
    reason: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
} 