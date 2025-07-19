// Auth API Types
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password2: string;
}

// Category API Types
export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

// Customer API Types
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  status?: "active" | "inactive";
  notes?: string;
}

// Order API Types
export interface OrderItem {
  product: string | Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: string | Customer;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderInput {
  customerId: string;
  customerName: string;
  items: Array<{
    product: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

// Product API Types
export interface ProductStock {
  warehouse: string | Warehouse;
  unit: number;
  dp: number;
  mrp: number;
}

export interface Product {
  _id: string;
  name: string;
  upc: string;
  category: string | Category;
  stock: ProductStock[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  upc: string;
  category: string;
  stock: Array<{
    warehouse: string;
    unit: number;
    dp: number;
    mrp: number;
  }>;
}

// User API Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "staff";
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: "admin" | "manager" | "staff";
  isActive?: boolean;
  avatar?: string;
}

// Warehouse API Types
export interface Warehouse {
  _id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseInput {
  name: string;
  location: string;
}

// Dashboard API Types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    orderDate: string;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  revenueChart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface SalesAnalytics {
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  monthlySales: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  topCategories: Array<{
    category: string;
    revenue: number;
    orders: number;
  }>;
}

export interface InventoryAlerts {
  lowStockProducts: Array<{
    _id: string;
    name: string;
    currentStock: number;
    minStock: number;
    warehouse: string;
  }>;
  outOfStockProducts: Array<{
    _id: string;
    name: string;
    warehouse: string;
  }>;
  expiringProducts: Array<{
    _id: string;
    name: string;
    expiryDate: string;
    quantity: number;
  }>;
}

// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// All types are already exported above 