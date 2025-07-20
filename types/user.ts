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

export interface UserInput
  extends Omit<User, "id" | "createdAt" | "updatedAt" | "lastLoginAt"> {
  password?: string;
}
