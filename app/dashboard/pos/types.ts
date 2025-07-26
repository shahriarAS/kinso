import type { Product } from "@/features/products/types";

export interface CartItem {
  _id: string; // Product ID
  stockId: string; // Stock entry ID for FIFO
  name: string;
  barcode: string;
  quantity: number;
  price: number;
  availableStock: number;
  category?: string;
  brand?: string;
}

export interface CustomerOption {
  label: string;
  value: string;
  disabled?: boolean;
  _id?: string;
}

export interface WarehouseOption {
  label: string;
  value: string;
  _id: string;
}

export const categoryColors: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-700",
  clothing: "bg-pink-100 text-pink-700",
  food: "bg-green-100 text-green-700",
  books: "bg-purple-100 text-purple-700",
  sports: "bg-orange-100 text-orange-700",
  beauty: "bg-red-100 text-red-700",
  home: "bg-indigo-100 text-indigo-700",
  automotive: "bg-gray-100 text-gray-700",
};
