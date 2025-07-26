export interface Vendor {
  _id: string;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateVendorRequest {
  vendorId: string;
  vendorName: string;
}

export interface IUpdateVendorRequest {
  vendorId?: string;
  vendorName?: string;
}

export interface IVendorFilters {
  vendorId?: string;
  vendorName?: string;
  search?: string;
}

export interface IVendorResponse {
  success: boolean;
  data?: Vendor;
  message?: string;
}

export interface IVendorsResponse {
  success: boolean;
  data?: Vendor[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
} 