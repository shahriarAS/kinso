import type { Stock } from "@/features/stock/types";
import type { Outlet } from "@/features/outlets/types";

export interface CartItem {
  _id: string; // Product ID
  stockId: string; // Stock entry ID for sales tracking
  name: string;
  barcode: string;
  quantity: number;
  price: number;
  availableStock: number;
  category?: string;
  brand?: string;
  batchNumber?: string;
  expireDate?: string;
}

export interface CustomerOption {
  label: string;
  value: string;
  disabled?: boolean;
  _id?: string;
  email?: string;
  phone?: string;
}

export interface OutletOption {
  label: string;
  value: string;
  _id: string;
}

// Category colors for product grid styling
export const categoryColors: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-800",
  clothing: "bg-purple-100 text-purple-800", 
  food: "bg-green-100 text-green-800",
  books: "bg-orange-100 text-orange-800",
  toys: "bg-pink-100 text-pink-800",
  sports: "bg-red-100 text-red-800",
  beauty: "bg-indigo-100 text-indigo-800",
  home: "bg-yellow-100 text-yellow-800",
  health: "bg-teal-100 text-teal-800",
  automotive: "bg-gray-100 text-gray-800",
};
