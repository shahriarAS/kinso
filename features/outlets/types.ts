export interface Outlet {
  _id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutletInput {
  name: string;
  type: string;
}

export interface OutletUpdateInput {
  name?: string;
  type?: string;
}

export interface OutletFilters {
  name?: string;
  type?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface OutletResponse {
  success: boolean;
  data?: Outlet;
  message?: string;
}

export interface OutletsResponse {
  success: boolean;
  data?: Outlet[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface OutletInventory {
  outlet: Outlet;
  products: Array<{
    product: {
      _id: string;
      name: string;
      barcode: string;
      categoryId: string;
    };
    quantity: number;
    unit: string;
    dp?: number;
    mrp: number;
  }>;
  totalProducts: number;
  totalValue: number;
}

export interface OutletStats {
  totalOutlets: number;
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  outlets: Array<{
    _id: string;
    name: string;
    type: "Micro Outlet" | "Super Shop";
    productCount: number;
    totalValue: number;
  }>;
}

export interface OutletTypeStats {
  microOutlets: number;
  superShops: number;
} 