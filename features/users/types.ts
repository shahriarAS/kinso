export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  avatar?: string;
  outlet?: string;
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
  outlet?: string;
  avatar?: string;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  role?: "admin" | "manager" | "staff";
  isActive?: boolean;
  avatar?: string;
  outlet?: string;
}

export interface UserFilters {
  search?: string;
  role?: "admin" | "manager" | "staff";
  isActive?: boolean;
  outlet?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  data?: User[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Array<{
    role: "admin" | "manager" | "staff";
    count: number;
  }>;
  usersByOutlet: Array<{
    outlet: string;
    outletName: string;
    userCount: number;
  }>;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  avatar?: string;
  outlet?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
