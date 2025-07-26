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