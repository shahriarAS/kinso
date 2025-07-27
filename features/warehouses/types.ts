export interface Warehouse {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseInput {
  name: string;
}

export interface WarehouseUpdateInput {
  name?: string;
}

export interface WarehouseFilters {
  name?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface WarehouseResponse {
  success: boolean;
  data?: Warehouse;
  message?: string;
}

export interface WarehousesResponse {
  success: boolean;
  data?: Warehouse[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface WarehouseInventory {
  warehouse: Warehouse;
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

export interface WarehouseStats {
  totalWarehouses: number;
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  warehouses: Array<{
    _id: string;
    name: string;
    productCount: number;
    totalValue: number;
  }>;
}
