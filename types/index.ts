// Common enums
export type PaymentMethod =
  | "CASH"
  | "BKASH"
  | "ROCKET"
  | "NAGAD"
  | "BANK"
  | "CARD";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "BKASH",
  "ROCKET",
  "NAGAD",
  "BANK",
  "CARD",
];

export type UserRole = "admin" | "manager" | "staff";

export const USER_ROLES: UserRole[] = ["admin", "manager", "staff"];

export type OutletType = "Micro Outlet" | "Super Shop";

export const OUTLET_TYPES: OutletType[] = ["Micro Outlet", "Super Shop"];

export type LocationType = "Warehouse" | "Outlet";

export const LOCATION_TYPES: LocationType[] = ["Warehouse", "Outlet"];

export type DemandStatus = "Pending" | "Approved" | "ConvertedToStock";

export const DEMAND_STATUSES: DemandStatus[] = [
  "Pending",
  "Approved",
  "ConvertedToStock",
];

// Standard response structures
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListResponse<T = any> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
}

// Common filter interfaces
export interface BaseFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Common input interfaces
export interface BaseInput {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Common update interfaces
export interface BaseUpdateInput {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface InvoiceItem {
  title: string;
  description?: string;
  quantity: number;
  rate: number;
  price: number;
  warranty?: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  logo: string;
  mobile?: string;
  email?: string;
  soldBy?: string;
}

interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
}

export interface InvoiceData {
  _id?: string;
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  company: CompanyInfo;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  // signatory: {
  //     name: string;
  //     title: string;
  // };
  payments?: { method: string; amount: number }[];
  paid?: number;
  due?: number;
  inWords?: string;
  invoiceFooter?: string; // <-- add this
  invoiceFooterTitle?: string; // <-- add this
}
