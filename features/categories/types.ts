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
