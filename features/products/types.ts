import { Warehouse } from "@/features/warehouses";
import { Category } from "@/features/categories";

export interface Product {
  _id: string;
  name: string;
  upc: string;
  sku: string;
  category: string | Category;
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
  extends Omit<Product, "_id" | "createdAt" | "updatedAt" | "stock" | "category"> {
    category: string;
    stock: {
      warehouse: string;
      unit: number;
      dp?: number;
      mrp: number;
    }[];
  }
