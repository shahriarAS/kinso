export interface Vendor {
  _id: string;
  vendorId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorInput {
  vendorId: string;
  name: string;
}

export interface VendorUpdateInput {
  vendorId?: string;
  name?: string;
}

export interface VendorFilters {
  vendorId?: string;
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
    vendorId: string;
    name: string;
    brandCount: number;
  }>;
} 