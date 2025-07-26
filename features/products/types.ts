import { Warehouse } from "@/features/warehouses";
import { Category } from "@/features/categories";
import { Vendor } from "@/features/vendors";
import { Brand } from "@/features/brands";

export interface Product {
  _id: string;
  productId: string;
  name: string;
  barcode: string;
  vendorId: string | Vendor;
  brandId: string | Brand;
  categoryId: string | Category;
  warranty?: {
    value: number;
    unit: string;
  };
  stock: {
    warehouse: Warehouse;
    unit: number;
    dp?: number;
    mrp: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput
  extends Omit<
    Product,
    "_id" | "createdAt" | "updatedAt" | "stock" | "vendorId" | "brandId" | "categoryId"
  > {
  vendorId: string;
  brandId: string;
  categoryId: string;
  stock: {
    warehouse: string;
    unit: number;
    dp?: number;
    mrp: number;
  }[];
}

export interface ProductUpdateInput {
  productId?: string;
  name?: string;
  barcode?: string;
  vendorId?: string;
  brandId?: string;
  categoryId?: string;
  warranty?: {
    value: number;
    unit: string;
  };
}

export interface ProductFilters {
  productId?: string;
  name?: string;
  barcode?: string;
  vendorId?: string;
  brandId?: string;
  categoryId?: string;
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
  productId: string;
  name: string;
  barcode: string;
  vendorId: string;
  brandId: string;
  categoryId: string;
  stock: {
    _id: string;
    warehouse: string;
    unit: number;
    dp?: number;
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
    categoryId: string;
    categoryName: string;
    productCount: number;
  }>;
  productsByVendor: Array<{
    vendorId: string;
    vendorName: string;
    productCount: number;
  }>;
}
