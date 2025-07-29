export interface Customer {
  _id: string;
  name: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  membershipActive: boolean;
  totalPurchaseLastMonth: number;
  totalSales: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput
  extends Omit<Customer, "_id" | "createdAt" | "updatedAt"> {}

export interface CustomerFilters {
  search?: string;
  membershipStatus?: boolean;
  customerName?: string;
  status?: string;
  email?: string;
}