import type { Product } from "@/types/product";
import type { Customer } from "@/types/customer";
import type { Warehouse } from "@/types/warehouse";

export type CartItem = Product & { quantity: number; price: number };

export const DEFAULT_UNIT_PRICE = 1000;

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