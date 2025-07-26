// Auth Types
export type { UserRole, AuthenticatedRequest, AuthOptions, LoginInput, RegisterInput, AuthResponse, TokenPayload, Tokens } from "@/features/auth/types";

// User Types
export type { User, UserInput, UserUpdateInput, UserFilters, UserResponse, UsersResponse, UserStats, UserProfile, ChangePasswordRequest } from "@/features/users/types";

// Product Types
export type { Product, ProductInput, ProductUpdateInput, ProductFilters, ProductResponse, ProductsResponse, ProductSearchResult, ProductStats } from "@/features/products/types";

// Category Types
export type { Category, CategoryInput, CategoryUpdateInput, CategoryFilters, CategoryResponse, CategoriesResponse, CategoryStats } from "@/features/categories/types";

// Brand Types
export type { Brand, BrandInput, BrandUpdateInput, BrandFilters, BrandResponse, BrandsResponse, BrandStats } from "@/features/brands/types";

// Vendor Types
export type { Vendor, VendorInput, VendorUpdateInput, VendorFilters, VendorResponse, VendorsResponse, VendorStats } from "@/features/vendors/types";

// Customer Types
export type { Customer, CustomerInput, CustomerUpdateInput, CustomerFilters, MembershipUpdateInput, CustomerResponse, CustomersResponse, CustomerStats, CustomerOrderHistory } from "@/features/customers/types";

// Outlet Types
export type { Outlet, OutletInput, OutletUpdateInput, OutletFilters, OutletResponse, OutletsResponse, OutletInventory, OutletStats, OutletTypeStats } from "@/features/outlets/types";

// Warehouse Types
export type { Warehouse, WarehouseInput, WarehouseUpdateInput, WarehouseFilters, WarehouseResponse, WarehousesResponse, WarehouseInventory, WarehouseStats } from "@/features/warehouses/types";

// Stock Types
export type { Stock, StockInput, StockUpdateInput, StockFilters, StockApiResponse, StockResponse, StocksResponse, StockStats, StockMovement, StockMovementInput } from "@/features/stock/types";

// Order Types
export type { Order, OrderInput, OrderUpdateInput, OrderFilters, OrderResponse, OrdersResponse, OrderStats, Payment, OrderItem, PaymentMethod } from "@/features/orders/types";

// Sale Types
export type { Sale, CreateSaleRequest, SaleUpdateRequest, SaleReturnRequest, SalesHistoryFilters, SalesHistoryResponse, CartItem, SaleResponse, SalesResponse, SaleStats, SaleReturn, SaleItem } from "@/features/sales/types";

// Demand Types
export type { Demand, DemandInput, DemandUpdateInput, DemandFilters, DemandConversionRequest, DemandResponse, DemandApiResponse, DemandStats, DemandGenerationRequest } from "@/features/demand/types";

// Discount Types
export type { Discount, DiscountInput, DiscountUpdateInput, DiscountFilters, DiscountResponse, DiscountsResponse, ActiveDiscount } from "@/features/discounts/types";

// Settings Types
export type { Settings, SettingsInput, SettingsUpdateInput, SettingsResponse, CompanyInfo, InvoiceSettings, SystemSettings } from "@/features/settings/types";

// Dashboard Types
export type { RecentOrder, TopProduct, RevenueChartPoint, DashboardStats, LowStockProduct, OutOfStockProduct, ExpiringProduct, InventoryAlerts, SalesAnalytics, DashboardResponse, InventoryAlertsResponse, SalesAnalyticsResponse, DashboardFilters, QuickStats, PerformanceMetrics } from "@/features/dashboard/types";

// Report Types
export type { SalesReportResponse, InventoryReportResponse, CustomerReportResponse, ReportFilters, ReportRequest, ReportResponse, StockMovementReport, ProfitLossReport } from "@/features/reports/types";

// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data?: T[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FilterOptions {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select" | "textarea" | "date" | "checkbox" | "radio";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string | number;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T;
  onRowClick?: (record: T) => void;
}

// Notification Types
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Modal Types
export interface ModalConfig {
  title: string;
  content: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  width?: number | string;
  centered?: boolean;
  closable?: boolean;
}

// File Upload Types
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

export interface UploadConfig {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxCount?: number;
  onUpload?: (files: File[]) => void;
  onProgress?: (progress: number) => void;
  onSuccess?: (file: FileUpload) => void;
  onError?: (error: string) => void;
}