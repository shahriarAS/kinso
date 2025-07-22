export interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
}

export interface TopProduct {
  _id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  revenueChart: RevenueChartPoint[];
}

export interface LowStockProduct {
  _id: string;
  name: string;
  currentStock: number;
  minStock: number;
  warehouse: string;
}

export interface OutOfStockProduct {
  _id: string;
  name: string;
  warehouse: string;
}

export interface ExpiringProduct {
  _id: string;
  name: string;
  expiryDate: string;
  quantity: number;
}

export interface InventoryAlerts {
  lowStockProducts: LowStockProduct[];
  outOfStockProducts: OutOfStockProduct[];
  expiringProducts: ExpiringProduct[];
}

export interface SalesAnalytics {
  dailySales: RevenueChartPoint[];
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
