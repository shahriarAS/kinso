export interface Brand {
  _id: string;
  name: string;
  vendor: string;
  vendorDetails?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BrandInput {
  name: string;
  vendor: string;
}

export interface BrandUpdateInput {
  name?: string;
  vendor?: string;
}

export interface BrandFilters {
  name?: string;
  vendor?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BrandResponse {
  success: boolean;
  data?: Brand;
  message?: string;
}

export interface BrandsResponse {
  success: boolean;
  data?: Brand[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface BrandStats {
  totalBrands: number;
  brandsByVendor: Array<{
    vendor: string;
    vendorName: string;
    brandCount: number;
  }>;
} 