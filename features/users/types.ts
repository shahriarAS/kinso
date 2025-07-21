export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "manager" | "staff";
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: "admin" | "manager" | "staff";
  isActive?: boolean;
  avatar?: string;
}

export interface UserFilters {
  search?: string;
  role?: "admin" | "manager" | "staff";
}
