// Re-export all API hooks for easy import
export {
  // Auth API hooks
  useLoginUserMutation,
  useLogoutUserMutation,
  useFetchAuthUserQuery,
} from "@/store/api/auth";

export {
  // Categories API hooks
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoriesQuery,
} from "@/store/api/categories";

export {
  // Customers API hooks
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerStatsQuery,
  useSearchCustomersQuery,
} from "@/store/api/customers";

export {
  // Orders API hooks
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetOrdersByCustomerQuery,
} from "@/store/api/orders";

export {
  // Products API hooks
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductStockMutation,
} from "@/store/api/products";

export {
  // Users API hooks
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useSearchUsersQuery,
} from "@/store/api/users";

export {
  // Warehouses API hooks
  useGetWarehousesQuery,
  useGetWarehouseQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetWarehouseInventoryQuery,
  useGetWarehouseStatsQuery,
} from "@/store/api/warehouses";

export {
  // Dashboard API hooks
  useGetDashboardStatsQuery,
  useGetSalesAnalyticsQuery,
  useGetInventoryAlertsQuery,
} from "@/store/api/dashboard";

// Re-export types for easy import
export type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  Category,
  CategoryInput,
  Customer,
  CustomerInput,
  Order,
  OrderItem,
  OrderInput,
  Product,
  ProductInput,
  ProductStock,
  User,
  UserInput,
  UserUpdateInput,
  Warehouse,
  WarehouseInput,
  DashboardStats,
  SalesAnalytics,
  InventoryAlerts,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
} from "@/types/api";
