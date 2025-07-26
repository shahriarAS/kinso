export interface Customer {
  _id: string;
  customerId: string;
  customerName: string;
  contactInfo: string;
  purchaseAmount: number;
  membershipStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput
  extends Omit<Customer, "_id" | "createdAt" | "updatedAt"> {}

export interface CustomerFilters {
  search?: string;
  membershipStatus?: boolean;
  customerName?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MembershipUpdateInput {
  membershipStatus: boolean;
}
