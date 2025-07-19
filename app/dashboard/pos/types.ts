import type { Product } from "@/types/product";

export type CartItem = Product & { quantity: number; price: number };

export const DEFAULT_UNIT_PRICE = 1000;

export const customers = [
  { label: "Walk-in Customer", value: "walkin" },
  { label: "John Doe", value: "john" },
  { label: "Jane Smith", value: "jane" },
];

export const categoryColors: Record<string, string> = {
  electronics: "bg-blue-100 text-blue-700",
  clothing: "bg-pink-100 text-pink-700",
  food: "bg-green-100 text-green-700",
}; 