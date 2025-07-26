import { Warehouse } from "@/features/warehouses";
import { Category } from "@/features/categories";
import { Vendor } from "@/features/vendors";
import { Brand } from "@/features/brands";

export interface Product {
  _id: string;
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
