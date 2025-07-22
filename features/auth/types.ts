import { User } from "@/features/users/types";

export type UserRole = "admin" | "manager" | "staff";

export interface AuthenticatedRequest {
  user?: User;
}

export interface AuthOptions {
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  password2: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  type: "access" | "refresh";
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
