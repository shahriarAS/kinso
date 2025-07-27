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
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput
  extends Omit<Customer, "_id" | "createdAt" | "updatedAt"> {}

export interface CustomerUpdateInput {
  name?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  membershipActive?: boolean;
  totalPurchaseLastMonth?: number;
  totalOrders?: number;
  totalSpent?: number;
}

export interface CustomerFilters {
  search?: string;
  membershipActive?: boolean;
  name?: string;
  phone?: string;
  email?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface MembershipUpdateInput {
  membershipActive: boolean;
}

export interface CustomerResponse {
  success: boolean;
  data?: Customer;
  message?: string;
}

export interface CustomersResponse {
  success: boolean;
  data?: Customer[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface CustomerStats {
  totalCustomers: number;
  activeMembers: number;
  inactiveMembers: number;
  newCustomersThisMonth: number;
  topCustomers: Array<{
    _id: string;
    name: string;
    totalPurchase: number;
    membershipActive: boolean;
  }>;
}

export interface CustomerOrderHistory {
  _id: string;
  customerName: string;
  orders: Array<{
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    orderDate: string;
    status: string;
  }>;
  totalOrders: number;
  totalSpent: number;
}
