export interface Order {
  _id: string;
  orderNumber: string;
  customer: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

export interface OrderInput {
  customer: string;
  items: OrderItem[];
  totalAmount: number;
  status?: OrderStatus;
}

export interface OrderUpdateInput {
  customer?: string;
  items?: OrderItem[];
  totalAmount?: number;
  status?: OrderStatus;
}

export interface OrderFilters {
  customer?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
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