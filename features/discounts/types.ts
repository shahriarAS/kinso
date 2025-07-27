export interface Discount {
  _id: string;
  product: string;
  type: "General" | "Membership";
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountInput {
  product: string;
  type: "General" | "Membership";
  amount: number;
  startDate: string;
  endDate: string;
}

export interface DiscountUpdateInput {
  product?: string;
  type?: "General" | "Membership";
  amount?: number;
  startDate?: string;
  endDate?: string;
}

export interface DiscountFilters {
  product?: string;
  type?: "General" | "Membership";
  startDate?: string;
  endDate?: string;
  isActive?: boolean; // Computed field for active discounts
  search?: string;
}

export interface DiscountResponse {
  success: boolean;
  data?: Discount;
  message?: string;
}

export interface DiscountsResponse {
  success: boolean;
  data?: Discount[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface ActiveDiscount {
  _id: string;
  type: "General" | "Membership";
  amount: number;
  isActive: boolean;
} 