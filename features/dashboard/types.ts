export interface RecentSale {
  _id: string;
  saleId: string;
  customerName: string;
  totalAmount: number;
  paymentMethods: Array<{ method: string; amount: number }>;
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
  sales: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  pendingSales: number;
  lowStockProducts: number;
  recentSales: RecentSale[];
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
  analytics: Array<{
    period: string;
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
  }>;
  period: "daily" | "weekly" | "monthly";
  totalPeriods: number;
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
  outlet?: string;
}

export interface QuickStats {
  todayRevenue: number;
  todaySales: number;
  todayCustomers: number;
  weekRevenue: number;
  weekSales: number;
  monthRevenue: number;
  monthSales: number;
}

export interface PerformanceMetrics {
  revenueGrowth: number;
  salesGrowth: number;
  customerGrowth: number;
  averageSaleValue: number;
  customerRetentionRate: number;
}
