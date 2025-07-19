# API Documentation

This document provides comprehensive documentation for all API routes available in the EZ Enterprise Management System.

## Table of Contents

- [Authentication](#authentication)
- [Categories](#categories)
- [Customers](#customers)
- [Orders](#orders)
- [Products](#products)
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
- **Body**: `{ name: string, upc: string, category: string, stock: Array<{ warehouse: string, unit: number, dp: number, mrp: number }> }`
- **Response**: `{ message: string, data: Product }`

### Update Product
- **PUT** `/api/products/[id]`
- **Body**: `{ name?: string, upc?: string, category?: string, stock?: Array<{ warehouse: string, unit: number, dp: number, mrp: number }> }`
- **Response**: `{ message: string, data: Product }`

### Delete Product
- **DELETE** `/api/products/[id]`
- **Response**: `{ message: string }`

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
- **Response**: `{ dailySales, monthlySales, topCategories }`

### Get Inventory Alerts
- **GET** `/api/dashboard/inventory-alerts`
- **Response**: `{ lowStockProducts, outOfStockProducts, expiringProducts }`

## Usage Examples

### Using API Hooks in Components

```tsx
import { useGetCustomersQuery, useCreateCustomerMutation } from '@/hooks/useApi';

function CustomerList() {
  const { data, isLoading, error } = useGetCustomersQuery({ 
    page: 1, 
    limit: 10, 
    search: '' 
  });
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();

  const handleCreate = async (customerData) => {
    try {
      await createCustomer(customerData).unwrap();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(customer => (
        <div key={customer.id}>{customer.name}</div>
      ))}
    </div>
  );
}
```

### Using API Types

```tsx
import type { Customer, CustomerInput } from '@/types/api';

const customer: Customer = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  status: 'active',
  totalOrders: 5,
  totalSpent: 1500,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

const newCustomer: CustomerInput = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1234567891',
  status: 'active'
};
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Authentication

Most endpoints require authentication. Include the session cookie in requests. The auth middleware will handle token validation and user authorization based on roles.

## Pagination

List endpoints support pagination with the following parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `sortBy` - Field to sort by
- `sortOrder` - Sort direction ('asc' or 'desc')

## Caching

All API responses are automatically cached using RTK Query. Cache invalidation is handled automatically when mutations are performed. 