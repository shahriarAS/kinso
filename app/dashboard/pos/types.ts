// POS Types

export interface CartItem {
  _id: string;
  stock: string;
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
}

// Category colors for product display
export const categoryColors: Record<string, string> = {
  beverages: "bg-blue-200 text-blue-800",
  snacks: "bg-orange-200 text-orange-800",
  dairy: "bg-green-200 text-green-800",
  electronics: "bg-purple-200 text-purple-800",
  clothing: "bg-pink-200 text-pink-800",
  cosmetics: "bg-yellow-200 text-yellow-800",
  health: "bg-red-200 text-red-800",
  home: "bg-indigo-200 text-indigo-800",
  sports: "bg-teal-200 text-teal-800",
  books: "bg-gray-200 text-gray-800",
  toys: "bg-lime-200 text-lime-800",
  automotive: "bg-slate-200 text-slate-800",
  tools: "bg-amber-200 text-amber-800",
  garden: "bg-emerald-200 text-emerald-800",
  default: "bg-gray-200 text-gray-600",
};
