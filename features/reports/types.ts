export interface SalesReportResponse {
  success: boolean;
  data: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    byOutlet: Array<{
      outletId: string;
      outletName: string;
      salesCount: number;
      revenue: number;
    }>;
    byCategory: Array<{
      category: string;
      categoryName: string;
      salesCount: number;
      revenue: number;
    }>;
    byPaymentMethod: Array<{
      method: string;
      count: number;
      amount: number;
    }>;
    byDate: Array<{
      date: string;
      salesCount: number;
      revenue: number;
    }>;
  };
  message?: string;
}

export interface InventoryReportResponse {
  success: boolean;
  data: Array<{
    product: string;
    productName: string;
    locationId: string;
    locationName: string;
    locationType: string;
    quantity: number;
    mrp: number;
    tp: number;
    totalValue: number;
    expireDate: Date | null;
    batchNumber: string | null;
  }>;
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItems: number;
  };
  message?: string;
}

export interface CustomerReportResponse {
  success: boolean;
  data: Array<{
    customer: string;
    name: string;
    totalPurchases: number;
    totalSpent: number;
    averageOrderValue: number;
    membershipActive: boolean;
    lastPurchaseDate: Date | null;
    contactInfo: {
      phone?: string;
      email?: string;
      address?: string;
    };
  }>;
  summary: {
    totalCustomers: number;
    activeMembers: number;
    inactiveMembers: number;
    totalRevenue: number;
    averageCustomerValue: number;
  };
  message?: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  outletId?: string;
  warehouseId?: string;
  category?: string;
  vendor?: string;
  paymentMethod?: string;
  customer?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ReportRequest {
  type: "sales" | "inventory" | "customers";
  filters: ReportFilters;
  format?: "json" | "csv" | "pdf";
}

export interface ReportResponse {
  success: boolean;
  data?: any;
  message?: string;
  downloadUrl?: string;
  generatedAt: string;
}

export interface StockMovementReport {
  success: boolean;
  data: Array<{
    stockId: string;
    productName: string;
    fromLocation?: string;
    toLocation: string;
    quantity: number;
    movementType: "IN" | "OUT" | "TRANSFER";
    reason: string;
    createdBy: string;
    createdAt: string;
  }>;
  summary: {
    totalMovements: number;
    totalIn: number;
    totalOut: number;
    totalTransfers: number;
  };
  message?: string;
}

export interface ProfitLossReport {
  success: boolean;
  data: {
    revenue: number;
    costOfGoods: number;
    grossProfit: number;
    grossProfitMargin: number;
    expenses: number;
    netProfit: number;
    netProfitMargin: number;
    byProduct: Array<{
      product: string;
      productName: string;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    }>;
    byCategory: Array<{
      category: string;
      categoryName: string;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    }>;
  };
  message?: string;
} 