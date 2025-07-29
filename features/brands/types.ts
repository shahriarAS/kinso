import { Vendor } from "../vendors";

export interface Brand {
  _id: string;
  name: string;
  vendor: Vendor;
  createdAt: string;
  updatedAt: string;
}

export interface BrandInput {
  name: string;
  vendor: string;
}
