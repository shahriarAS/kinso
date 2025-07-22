export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  notes?: string;
}

export interface CustomerInput
  extends Omit<Customer, "_id" | "totalOrders" | "totalSpent"> {}

export interface CustomerFilters {
  search?: string;
  status?: "active" | "inactive";
  email?: string;
}
