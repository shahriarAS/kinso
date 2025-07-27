<!-- # API Documentation

This document provides comprehensive documentation for all API routes available in the EZ Enterprise Management System.

## Recent Critical Fixes (Latest Update)

### 🔴 **Critical Inconsistencies Fixed**

#### 1. **Payment Method Enum Mismatch - RESOLVED**
- **Issue**: Order model enum was missing "CARD" payment method
- **Fix**: Updated Order model enum to include "CARD": `["CASH", "BKASH", "ROCKET", "NAGAD", "BANK", "CARD"]`
- **Impact**: Orders API now accepts "CARD" payments consistently with Sales API

#### 2. **Order Model Field Inconsistencies - RESOLVED**
- **Issue**: Model defined `customer` field but service used `customerId`
- **Fix**: Standardized to use `customerId` throughout Order model, types, and service
- **Impact**: Consistent field naming across all Order-related operations

#### 3. **Product Stock Structure Mismatch - RESOLVED**
- **Issue**: Product types expected `stock` array but model didn't have it
- **Fix**: Added `stock` field to Product model with warehouse-based structure
- **Impact**: Stock management now works correctly with product inventory

#### 4. **Response Structure Inconsistencies - RESOLVED**
- **Issue**: Some APIs missing `totalPages` in pagination response
- **Fix**: Standardized all pagination responses to include `totalPages`
- **Impact**: Consistent pagination structure across all APIs

### 🟡 **Moderate Inconsistencies Fixed**

#### 5. **Stock API Response Structure - RESOLVED**
- **Issue**: Stock service missing `totalPages` in pagination
- **Fix**: Added `totalPages: Math.ceil(total / limit)` to stock pagination
- **Impact**: Consistent pagination response format

#### 6. **Type Definition Updates - RESOLVED**
- **Issue**: Order types using `customer` instead of `customerId`
- **Fix**: Updated all Order type definitions to use `customerId`
- **Impact**: Type safety and consistency across frontend and backend

### ✅ **All Critical and Moderate Issues Resolved**

The system now has:
- ✅ Consistent payment method enums across all features
- ✅ Standardized field naming (`customerId` vs `customer`)
- ✅ Complete product stock management structure
- ✅ Uniform pagination response format
- ✅ Type-safe interfaces throughout the application

## Table of Contents

- [Authentication](#authentication)
- [Categories](#categories)
- [Customers](#customers)
- [Demands](#demands)
- [Orders](#orders)
- [Products](#products)
- [Sales](#sales)
- [Users](#users)
- [Warehouses](#warehouses)
- [Dashboard](#dashboard)

## Authentication

### Login

- **POST** `/api/auth/login`
- **Body**: `{ email: string, password: string }`
- **Response**: `{ message: string, user: User }`

### Logout

- **POST** `/api/auth/logout`
- **Response**: `{ message: string }`

### Get Current User

- **GET** `/api/auth/profile`
- **Response**: `{ message: string, user: User }`

### Register

- **POST** `/api/auth/register`
- **Body**: `{ name: string, email: string, password: string, password2: string }`
- **Response**: `{ message: string }`

## Categories

### Get All Categories

- **GET** `/api/categories`
- **Query Parameters**: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- **Response**: `{ data: Category[], pagination: { page, limit, total, totalPages } }`

### Get Category by ID

- **GET** `/api/categories/[id]`
- **Response**: `{ data: Category }`

### Create Category

- **POST** `/api/categories`
- **Body**: `{ name: string, description?: string }`
- **Response**: `{ message: string, data: Category }`

### Update Category

- **PUT** `/api/categories/[id]`
- **Body**: `{ name?: string, description?: string }`
- **Response**: `{ message: string, data: Category }`

### Delete Category

- **DELETE** `/api/categories/[id]`
- **Response**: `{ message: string }`

## Customers

### Get All Customers

- **GET** `/api/customers`
- **Query Parameters**: `page`, `limit`, `search`, `status`, `sortBy`, `sortOrder`
- **Response**: `{ data: Customer[], pagination: { page, limit, total, totalPages } }`

### Get Customer by ID

- **GET** `/api/customers/[id]`
- **Response**: `{ data: Customer }`

### Create Customer

- **POST** `/api/customers`
- **Body**: `{ name: string, email: string, phone: string, status?: string, notes?: string }`
- **Response**: `{ message: string, data: Customer }`

### Update Customer

- **PUT** `/api/customers/[id]`
- **Body**: `{ name?: string, email?: string, phone?: string, status?: string, notes?: string }`
- **Response**: `{ message: string, data: Customer }`

### Delete Customer

- **DELETE** `/api/customers/[id]`
- **Response**: `{ message: string }`

## Demands

### Get All Demands

- **GET** `/api/demands`
- **Query Parameters**: `page`, `limit`, `locationId`, `locationType`, `status`, `sortBy`, `sortOrder`
- **Response**: `{ data: Demand[], pagination: { page, limit, total, totalPages } }`

### Get Demand by ID

- **GET** `/api/demands/[id]`
- **Response**: `{ data: Demand }`

### Create Demand

- **POST** `/api/demands`
- **Body**: `{ demandId: string, locationId: string, locationType: "Warehouse" | "Outlet", products: Array<{ productId: string, quantity: number }>, status: "Pending" | "Approved" | "ConvertedToStock" }`
- **Response**: `{ message: string, data: Demand }`

### Update Demand

- **PUT** `/api/demands/[id]`
- **Body**: `{ locationId?: string, locationType?: "Warehouse" | "Outlet", products?: Array<{ productId: string, quantity: number }>, status?: "Pending" | "Approved" | "ConvertedToStock" }`
- **Response**: `{ message: string, data: Demand }`

### Delete Demand

- **DELETE** `/api/demands/[id]`
- **Response**: `{ message: string }`

### Generate Demands

- **POST** `/api/demands/generate`
- **Body**: `{ outletId?: string, warehouseId?: string, days?: number, minSalesThreshold?: number, demandDays?: number, safetyStockFactor?: number, seasonalAdjustment?: number }`
- **Response**: `{ message: string, data: { generatedCount: number, demands: Demand[], analysis: object } }`

### Convert Demand to Stock

- **POST** `/api/demands/[id]/convert`
- **Body**: `{ mrp: number, tp: number, expireDate: string, batchNumber: string }`
- **Response**: `{ message: string, data: Stock }`

## Orders

### Get All Orders

- **GET** `/api/orders`
- **Query Parameters**: `page`, `limit`, `search`, `customerId`, `sortBy`, `sortOrder`
- **Response**: `{ data: Order[], pagination: { page, limit, total, totalPages } }`

### Get Order by ID

- **GET** `/api/orders/[id]`
- **Response**: `{ data: Order }`

### Create Order

- **POST** `/api/orders`
- **Body**: `{ customerId: string, customerName: string, items: Array<{ product: string, quantity: number, unitPrice: number }>, notes?: string }`
- **Response**: `{ message: string, data: Order }`

### Update Order

- **PUT** `/api/orders/[id]`
- **Body**: `{ customerId?: string, customerName?: string, items?: Array<{ product: string, quantity: number, unitPrice: number }>, notes?: string }`
- **Response**: `{ message: string, data: Order }`

### Delete Order

- **DELETE** `/api/orders/[id]`
- **Response**: `{ message: string }`

## Products

### Get All Products

- **GET** `/api/products`
- **Query Parameters**: `page`, `limit`, `search`, `category`, `warehouse`, `lowStock`, `sortBy`, `sortOrder`
- **Response**: `{ data: Product[], pagination: { page, limit, total, totalPages } }`

### Get Product by ID

- **GET** `/api/products/[id]`
- **Response**: `{ data: Product }`

### Create Product

- **POST** `/api/products`
- **Body**: `{ name: string, sku: string, category: string, stock: Array<{ warehouse: string, unit: number, dp: number, mrp: number }> }`
- **Response**: `{ message: string, data: Product }`

### Update Product

- **PUT** `/api/products/[id]`
- **Body**: `{ name?: string, sku?: string, category?: string, stock?: Array<{ warehouse: string, unit: number, dp: number, mrp: number }> }`
- **Response**: `{ message: string, data: Product }`

### Delete Product

- **DELETE** `/api/products/[id]`
- **Response**: `{ message: string }`

### Search Products

- **GET** `/api/products/search`
- **Query Parameters**: `query`, `outletId`
- **Response**: `{ data: ProductSearchResult[] }`

## Sales

### Get All Sales

- **GET** `/api/sales`
- **Query Parameters**: `page`, `limit`, `outletId`, `customerId`, `startDate`, `endDate`, `paymentMethod`, `minAmount`, `maxAmount`, `search`, `sortBy`, `sortOrder`
- **Response**: `{ data: Sale[], total, page, limit, totalPages }`

### Get Sales History

- **GET** `/api/sales/history`
- **Query Parameters**: `page`, `limit`, `outletId`, `customerId`, `startDate`, `endDate`, `paymentMethod`, `minAmount`, `maxAmount`, `search`, `sortBy`, `sortOrder`
- **Response**: `{ data: Sale[], total, page, limit, totalPages }`

### Get Sale by ID

- **GET** `/api/sales/[id]`
- **Response**: `{ data: Sale }`

### Create Sale

- **POST** `/api/sales`
- **Body**: `{ outletId: string, customerId?: string, items: Array<{ stockId: string, quantity: number, unitPrice: number, discountApplied: number }>, paymentMethod: "CASH" | "BKASH" | "ROCKET" | "NAGAD" | "BANK" | "CARD", discountAmount: number, notes?: string }`
- **Response**: `{ message: string, data: Sale }`

### Process Sale Return

- **POST** `/api/sales/returns`
- **Body**: `{ saleId: string, items: Array<{ stockId: string, quantity: number, reason: string }>, notes?: string }`
- **Response**: `{ message: string, data: SaleReturn }`

### Get Sales Statistics

- **GET** `/api/sales/stats`
- **Query Parameters**: `startDate`, `endDate`, `outletId`
- **Response**: `{ data: { totalSales, totalRevenue, averageSaleValue, salesByPaymentMethod, salesByDate } }`

### Search Products for POS

- **GET** `/api/sales/search`
- **Query Parameters**: `query`, `outletId`
- **Response**: `{ data: ProductSearchResult[] }`

## Users

### Get All Users

- **GET** `/api/users`
- **Query Parameters**: `page`, `limit`, `search`, `role`, `sortBy`, `sortOrder`
- **Response**: `{ data: User[], pagination: { page, limit, total, totalPages } }`

### Get User by ID

- **GET** `/api/users/[id]`
- **Response**: `{ data: User }`

### Create User

- **POST** `/api/users`
- **Body**: `{ name: string, email: string, password: string, role?: string }`
- **Response**: `{ message: string, data: User }`

### Update User

- **PUT** `/api/users/[id]`
- **Body**: `{ name?: string, email?: string, role?: string, isActive?: boolean, avatar?: string }`
- **Response**: `{ message: string, data: User }`

### Delete User

- **DELETE** `/api/users/[id]`
- **Response**: `{ message: string }`

## Warehouses

### Get All Warehouses

- **GET** `/api/warehouses`
- **Query Parameters**: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- **Response**: `{ data: Warehouse[], pagination: { page, limit, total, totalPages } }`

### Get Warehouse by ID

- **GET** `/api/warehouses/[id]`
- **Response**: `{ data: Warehouse }`

### Create Warehouse

- **POST** `/api/warehouses`
- **Body**: `{ name: string, location: string }`
- **Response**: `{ message: string, data: Warehouse }`

### Update Warehouse

- **PUT** `/api/warehouses/[id]`
- **Body**: `{ name?: string, location?: string }`
- **Response**: `{ message: string, data: Warehouse }`

### Delete Warehouse

- **DELETE** `/api/warehouses/[id]`
- **Response**: `{ message: string }`

## Dashboard

### Get Dashboard Statistics

- **GET** `/api/dashboard/stats`
- **Query Parameters**: `startDate`, `endDate`
- **Response**: `{ totalRevenue, totalOrders, totalCustomers, totalProducts, pendingOrders, lowStockProducts, recentOrders, topProducts, revenueChart }`

### Get Sales Analytics

- **GET** `/api/dashboard/sales-analytics`
- **Query Parameters**: `period`, `startDate`, `endDate`
- **Response**: `