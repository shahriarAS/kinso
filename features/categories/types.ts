export interface Category {
  _id: string;
  categoryId: string;
  categoryName: string;
  vatStatus: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  categoryId: string;
  categoryName: string;
  vatStatus: boolean;
  description?: string;
}
