export interface Discount {
  _id: string;
  discountId: string;
  productId: string;
  type: "General" | "Membership";
  amount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountInput {
  discountId: string;
  productId: string;
  type: "General" | "Membership";
  amount: number;
  startDate: string;
  endDate: string;
}

export interface DiscountUpdateInput {
  discountId?: string;
  productId?: string;
  type?: "General" | "Membership";
  amount?: number;
  startDate?: string;
  endDate?: string;
}

export interface DiscountFilters {
  productId?: string;
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
  discountId: string;
  type: "General" | "Membership";
  amount: number;
  isActive: boolean;
} 