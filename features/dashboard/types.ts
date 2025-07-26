export interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface TopProduct {
  _id: string;
  name: string;
  totalSold: number;
  revenue: number;
  category: string;
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
  locationType: "Warehouse" | "Outlet";
}

export interface OutOfStockProduct {
  _id: string;
  name: string;
  warehouse: string;
  locationType: "Warehouse" | "Outlet";
}

export interface ExpiringProduct {
  _id: string;
  name: string;
  expiryDate: string;
  quantity: number;
  warehouse: string;
  locationType: "Warehouse" | "Outlet";
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

export interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  message?: string;
}

export interface InventoryAlertsResponse {
  success: boolean;
  data?: InventoryAlerts;
  message?: string;
}

export interface SalesAnalyticsResponse {
  success: boolean;
  data?: SalesAnalytics;
  message?: string;
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  outletId?: string;
  warehouseId?: string;
}

export interface QuickStats {
  todayRevenue: number;
  todayOrders: number;
  todayCustomers: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
}

export interface PerformanceMetrics {
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  averageOrderValue: number;
  customerRetentionRate: number;
}
