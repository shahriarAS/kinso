import { Product } from "@/features/products/types";
import { PaymentMethod } from "@/types";

export interface Payment {
  method: PaymentMethod;
  amount: number;
}

export interface OrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  payments: Payment[];
  discount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  warehouse: string;
}

export interface OrderInput
  extends Omit<
    Order,
    | "_id"
    | "orderNumber"
    | "createdAt"
    | "updatedAt"
  > {}

export interface OrderUpdateInput {
  customer?: string;
  customerName?: string;
  items?: OrderItem[];
  totalAmount?: number;
  payments?: Payment[];
  discount?: number;
  notes?: string;
  warehouse?: string;
}

export interface OrderFilters {
  orderNumber?: string;
  customer?: string;
  customerName?: string;
  warehouse?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface OrderResponse {
  success: boolean;
  data?: Order;
  message?: string;
}

export interface OrdersResponse {
  success: boolean;
  data?: Order[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
  ordersByPaymentMethod: Array<{
    method: PaymentMethod;
    count: number;
    totalAmount: number;
  }>;
  ordersByWarehouse: Array<{
    warehouseId: string;
    warehouseName: string;
    orderCount: number;
    totalRevenue: number;
  }>;
}
