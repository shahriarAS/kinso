export interface Customer {
  _id: string;
  customerId: string;
  name: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  membershipActive: boolean;
  totalPurchaseLastMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput
  extends Omit<Customer, "_id" | "createdAt" | "updatedAt"> {}

export interface CustomerFilters {
  search?: string;
  membershipActive?: boolean;
  name?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MembershipUpdateInput {
  membershipActive: boolean;
}
