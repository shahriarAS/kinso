export interface Outlet {
  _id: string;
  outletId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutletInput {
  outletId: string;
  name: string;
}

export interface OutletInventory {
  outlet: Outlet;
  products: Array<{
    product: {
      _id: string;
      name: string;
      upc: string;
      sku: string;
      category: string;
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
    outletId: string;
    name: string;
    productCount: number;
    totalValue: number;
  }>;
} 