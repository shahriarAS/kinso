export interface Brand {
  _id: string;
  brandId: string;
  name: string;
  vendorId: string;
  vendor?: {
    _id: string;
    vendorId: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BrandInput {
  brandId: string;
  name: string;
  vendorId: string;
}

export interface BrandUpdateInput {
  brandId?: string;
  name?: string;
  vendorId?: string;
}

export interface BrandFilters {
  brandId?: string;
  name?: string;
  vendorId?: string;
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
    vendorId: string;
    vendorName: string;
    brandCount: number;
  }>;
} 