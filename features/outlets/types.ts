export interface Outlet {
  _id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutletInput {
  name: string;
  type: string;
}