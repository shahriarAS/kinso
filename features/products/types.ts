import { Warehouse } from "@/features/warehouses";
import { Category } from "@/features/categories";
import { Vendor } from "@/features/vendors";
import { Brand } from "@/features/brands";

export interface Product {
  _id: string;
  name: string;
  barcode: string;
  vendor: string;
  brand: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput
  extends Omit<
    Product,
    "_id" | "createdAt" | "updatedAt"
  > {}

export interface ProductUpdateInput {
  name?: string;
  barcode?: string;
  vendor?: string;
  brand?: string;
  category?: string;
}

export interface ProductFilters {
  name?: string;
  barcode?: string;
  vendor?: string;
  brand?: string;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  inStock?: boolean;
  lowStock?: boolean;
}

export interface ProductResponse {
  success: boolean;
  data?: Product;
  message?: string;
}

export interface ProductsResponse {
  success: boolean;
  data?: Product[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  _id: string;
  name: string;
  barcode: string;
  vendor: string;
  brand: string;
  category: string;
  stock: {
    _id: string;
    warehouse: string;
    unit: number;
    tp: number;
    mrp: number;
    expireDate: string;
  }[];
}

export interface ProductStats {
  totalProducts: number;
  productsInStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  productsByCategory: Array<{
    category: string;
    categoryName: string;
    productCount: number;
  }>;
  productsByVendor: Array<{
    vendor: string;
    vendorName: string;
    productCount: number;
  }>;
}
