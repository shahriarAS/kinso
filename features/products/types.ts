import { Warehouse } from "@/types/warehouse";

export interface Product {
  _id: string;
  name: string;
  upc: string;
  sku: string;
  category: string | { _id: string; name: string };
  stock: {
    warehouse: Warehouse;
    unit: number;
    dp: number;
    mrp: number;
  }[];
}

export interface ProductInput {
  name: string;
  upc: string;
  sku: string;
  category: string;
  stock: {
    warehouse: string; // API expects warehouse ID as string
    unit: number;
    dp: number;
    mrp: number;
  }[];
}
