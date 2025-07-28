import { Category } from "@/features/categories";
import { Vendor } from "@/features/vendors";
import { Brand } from "@/features/brands";

export interface Product {
  _id: string;
  name: string;
  barcode: string;
  vendor: Vendor;
  brand: Brand;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  barcode: string;
  vendor: string;
  brand: string;
  category: string;
}