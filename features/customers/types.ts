export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  membershipActive: boolean;
  totalPurchaseLastMonth: number;
  totalSales: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  phone: string;
  email: string;
  address?: string;
  membershipActive?: boolean;
}

export interface CustomerFilters {
  search?: string;
  membershipStatus?: boolean;
  customerName?: string;
  status?: string;
  email?: string;
}