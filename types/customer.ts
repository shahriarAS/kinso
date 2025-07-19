export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  registrationDate: string;
  totalOrders: number;
  totalSpent: number;
  status: "active" | "inactive";
  notes?: string;
}

export interface CustomerInput extends Omit<Customer, "id" | "registrationDate" | "totalOrders" | "totalSpent"> {} 