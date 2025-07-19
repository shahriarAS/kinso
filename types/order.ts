import { Product } from "./product";

export interface Order {
  id: string;
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
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  deliveryDate?: string;
  paymentStatus: "pending" | "paid" | "failed";
  shippingAddress: string;
  notes?: string;
}

export interface OrderInput extends Omit<Order, "id"> {} 