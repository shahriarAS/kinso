import { Product } from "./product";

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: {
    product: Product;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderInput extends Omit<Order, "_id" | "orderNumber" | "createdAt" | "updatedAt"> {} 