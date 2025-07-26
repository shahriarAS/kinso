export interface Warehouse {
  _id: string;
  warehouseId: string;
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseInput {
  warehouseId: string;
  name: string;
  location: string;
}
