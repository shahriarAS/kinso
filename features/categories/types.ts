export interface Category {
  _id: string;
  categoryId: string;
  name: string;
  applyVAT: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  categoryId: string;
  name: string;
  applyVAT: boolean;
}

export interface CategoryUpdateInput {
  categoryId?: string;
  name?: string;
  applyVAT?: boolean;
}

export interface CategoryFilters {
  categoryId?: string;
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
