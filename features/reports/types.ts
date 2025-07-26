export interface SalesReportResponse {
  success: boolean;
  data: {
    totalSales: number;
    totalRevenue: number;
    byOutlet: Array<{
      outletId: string;
      salesCount: number;
      revenue: number;
    }>;
    byCategory: Array<{
      categoryId: string;
      salesCount: number;
      revenue: number;
    }>;
  };
}

export interface InventoryReportResponse {
  success: boolean;
  data: Array<{
    productId: string;
    locationId: string;
    locationType: string;
    quantity: number;
    mrp: number;
    tp: number;
    expireDate: Date | null;
    batchNumber: string | null;
  }>;
}

export interface CustomerReportResponse {
  success: boolean;
  data: Array<{
    customerId: string;
    name: string;
    totalPurchases: number;
    membershipActive: boolean;
    lastPurchaseDate: Date | null;
  }>;
} 