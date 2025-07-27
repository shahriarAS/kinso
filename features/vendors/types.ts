export interface Vendor {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorInput {
  name: string;
}

export interface VendorUpdateInput {
  name?: string;
}

export interface VendorFilters {
  name?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface VendorResponse {
  success: boolean;
  data?: Vendor;
  message?: string;
}

export interface VendorsResponse {
  success: boolean;
  data?: Vendor[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface VendorStats {
  totalVendors: number;
  vendorsWithBrands: number;
  topVendors: Array<{
    _id: string;
    name: string;
    brandCount: number;
  }>;
} 