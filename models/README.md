# MongoDB/Mongoose Models

This directory contains all the MongoDB/Mongoose schemas for the EZ Inventory Management System.

## Models Overview

### Core Business Models

#### 1. **User** (`User.ts`)

- **Purpose**: Manages system users (admin, manager, staff)
- **Key Fields**: name, email, password, role, avatar, isActive
- **Indexes**: email, role, isActive
- **Relationships**: Referenced by AuditLog, Notification

#### 2. **Category** (`Category.ts`)

- **Purpose**: Product categorization
- **Key Fields**: name, description
- **Indexes**: name (unique)
- **Relationships**: Referenced by Product

#### 3. **Warehouse** (`Warehouse.ts`)

- **Purpose**: Inventory storage locations
- **Key Fields**: name, location
- **Indexes**: name, location
- **Relationships**: Referenced by Product (stock array)

#### 4. **Product** (`Product.ts`)

- **Purpose**: Inventory items with stock management
- **Key Fields**: name, upc, sku, category, stock[]
- **Embedded Schema**: Stock (warehouse, unit, dp, mrp)
- **Indexes**: sku (unique), upc(unique) name, category, stock.warehouse
- **Relationships**: References Category, Warehouse; Referenced by Order

#### 5. **Customer** (`Customer.ts`)

- **Purpose**: Customer information and statistics
- **Key Fields**: name, email, phone, address, status, totalOrders, totalSpent
- **Indexes**: email, phone, name, status, registrationDate
- **Relationships**: Referenced by Order

#### 6. **Order** (`Order.ts`)

- **Purpose**: Sales orders with items and status tracking
- **Key Fields**: orderNumber, customerId, items[], totalAmount, status, paymentStatus
- **Embedded Schema**: OrderItem (product, quantity, unitPrice, totalPrice)
- **Indexes**: orderNumber (unique), customerId, status, paymentStatus, orderDate
- **Relationships**: References Customer, Product

### System Models

#### 7. **AuditLog** (`AuditLog.ts`)

- **Purpose**: System activity tracking and audit trail
- **Key Fields**: action, entity, entityId, userId, changes, timestamp
- **Indexes**: entity, entityId, userId, timestamp
- **Relationships**: References User

#### 8. **Notification** (`Notification.ts`)

- **Purpose**: System notifications for users
- **Key Fields**: type, title, message, read, userId
- **Indexes**: type, read, timestamp, userId
- **Relationships**: References User

## Database Connection

The database connection is managed in `lib/database.ts` with:

- Connection caching for development
- Environment variable configuration
- Error handling

## Usage Examples

### Basic CRUD Operations

```typescript
import dbConnect from "@/lib/database";
import { User, Product, Order } from "@/models";

// Create
const user = await User.create({
  name: "John Doe",
  email: "john@example.com",
  password: "hashedPassword",
  role: "staff",
});

// Read
const users = await User.find({ role: "admin" }).populate("role");

// Update
await User.findByIdAndUpdate(userId, { isActive: false });

// Delete
await User.findByIdAndDelete(userId);
```

### Complex Queries

```typescript
// Find products with low stock
const lowStockProducts = await Product.find({
  "stock.unit": { $lt: 10 },
}).populate("category");

// Find orders by date range
const orders = await Order.find({
  orderDate: {
    $gte: new Date("2024-01-01"),
    $lte: new Date("2024-12-31"),
  },
}).populate("customerId");

// Aggregate customer spending
const customerStats = await Customer.aggregate([
  { $group: { _id: "$status", totalSpent: { $sum: "$totalSpent" } } },
]);
```

### Relationships and Population

```typescript
// Populate nested relationships
const order = await Order.findById(orderId)
  .populate("customerId")
  .populate("items.product");

// Update related documents
const order = await Order.findById(orderId);
await Customer.findByIdAndUpdate(order.customerId, {
  $inc: { totalOrders: 1, totalSpent: order.totalAmount },
});
```

## Environment Setup

Add to your `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/ez-inventory
# or for production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ez-inventory
```

## Best Practices

1. **Always use indexes** for frequently queried fields
2. **Use population** for related data instead of multiple queries
3. **Validate data** at the schema level
4. **Use transactions** for operations affecting multiple documents
5. **Implement proper error handling** for database operations
6. **Use lean queries** for read-only operations to improve performance

## Schema Design Decisions

1. **Embedded vs Referenced**:
   - Stock information is embedded in Product for performance
   - Order items are embedded for atomicity
   - User references are used for audit trails

2. **Indexing Strategy**:
   - Unique indexes on business keys (email, sku, orderNumber)
   - Compound indexes for common query patterns
   - Text indexes for search functionality

3. **Data Validation**:
   - Required fields are enforced at schema level
   - Enums for status fields ensure data consistency
   - Min/max values for numeric fields
