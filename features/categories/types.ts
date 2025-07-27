export interface Category {
  _id: string;
  name: string;
  applyVAT: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  applyVAT: boolean;
}

export interface CategoryUpdateInput {
  name?: string;
  applyVAT?: boolean;
}

export interface CategoryFilters {
  name?: string;
  applyVAT?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CategoryResponse {
  success: boolean;
  data?: Category;
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data?: Category[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface CategoryStats {
  totalCategories: number;
  vatCategories: number;
  nonVatCategories: number;
}
