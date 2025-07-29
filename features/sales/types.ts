import { Customer } from "@/features/customers";
import { Outlet } from "@/features/outlets";
import { User } from "@/features/users";
import { Stock } from "@/features/stock";
import { PaymentMethod } from "@/types";

export interface Sale {
  _id: string;
  saleId: string;
  outlet: Outlet;
  customer?: Customer;
  saleDate: string;
  totalAmount: number;
  items: {
    stock: Stock;
    quantity: number;
    unitPrice: number;
    discountApplied: number;
  }[];
  paymentMethod: PaymentMethod;
  discountAmount: number;
  notes?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface SaleInput {
  outlet: string;
  customer?: string;
  items: {
    stock: string;
    quantity: number;
    unitPrice: number;
    discountApplied: number;
  }[];
  paymentMethod: PaymentMethod;
  discountAmount: number;
  notes?: string;
}