export interface Brand {
  _id: string;
  brandId: string;
  brandName: string;
  vendorId: string;
  vendor?: {
    _id: string;
    vendorId: string;
    vendorName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ICreateBrandRequest {
  brandId: string;
  brandName: string;
  vendorId: string;
}

export interface IUpdateBrandRequest {
  brandId?: string;
  brandName?: string;
  vendorId?: string;
}

export interface IBrandFilters {
  brandId?: string;
  brandName?: string;
  vendorId?: string;
  search?: string;
}

export interface IBrandResponse {
  success: boolean;
  data?: Brand;
  message?: string;
}

export interface IBrandsResponse {
  success: boolean;
  data?: Brand[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
} 