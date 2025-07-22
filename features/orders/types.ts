import { Product } from "@/features/products/types";
import { Warehouse } from "../warehouses";

export type PaymentMethod = "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK";

export interface Payment {
  method: PaymentMethod;
  amount: number;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  payments: Payment[];
  discount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  warehouse: Warehouse;
  paid: number; // Computed: sum of payments
  due: number; // Computed: totalAmount - paid
}

export interface OrderInput
  extends Omit<
    Order,
    | "_id"
    | "orderNumber"
    | "createdAt"
    | "updatedAt"
    | "items"
    | "warehouse"
    | "paid"
    | "due"
  > {
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  warehouse: string;
}
