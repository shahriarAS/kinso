import { Outlet } from "../outlets";
import { Product } from "../products";
import { Warehouse } from "../warehouses";

export interface Stock {
  _id: string;
  product: Product;
  location: Warehouse | Outlet;
  locationType: string;
  mrp: number;
  tp: number;
  expireDate: string;
  unit: number;
  batchNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockInput {
  product: string;
  location: string;
  locationType: string;
  mrp: number;
  tp: number;
  expireDate: string;
  unit: number;
  batchNumber: string;
}
