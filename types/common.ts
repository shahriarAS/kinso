// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Common filter types
export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Common status types
export type Status =
  | "active"
  | "inactive"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

// Common date range type
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

// Common select option type
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Common table column type
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  width?: number | string;
  fixed?: "left" | "right";
  ellipsis?: boolean;
}

// Common form field type
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "date"
    | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  rules?: any[];
  disabled?: boolean;
}

// Common notification type
export interface Notification {
  _id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

// Common file upload type
export interface FileUpload {
  _id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

// Common audit log type
export interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}
