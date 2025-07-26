# Outlet and Warehouse Management Implementation

## Overview

This document describes the implementation of Outlet and Warehouse Management features for the Kinso inventory system. The implementation includes both new Outlet functionality and enhanced Warehouse functionality with unique identifiers.

## Architecture

### Outlet Management

#### Schema Design
- **Location**: `/features/outlets/model.ts`
- **Fields**:
  - `outletId` (String, unique, required) - Unique identifier for the outlet
  - `name` (String, required) - Display name of the outlet
  - `createdAt` (Date) - Timestamp of creation
  - `updatedAt` (Date) - Timestamp of last update

#### API Endpoints
- **GET** `/api/outlets` - List all outlets with pagination and search
- **POST** `/api/outlets` - Create a new outlet
- **GET** `/api/outlets/[_id]` - Get a specific outlet
- **PUT** `/api/outlets/[_id]` - Update an outlet
- **DELETE** `/api/outlets/[_id]` - Delete an outlet
- **GET** `/api/outlets/[_id]/inventory` - Get outlet inventory
- **GET** `/api/outlets/stats` - Get outlet statistics

#### UI Components
- **OutletTable** - Displays outlets in a table format with actions
- **AddEditOutletDrawer** - Form for creating/editing outlets
- **ViewOutletDrawer** - Detailed view of outlet with inventory
- **OutletsPage** - Main page for outlet management

### Warehouse Management (Enhanced)

#### Schema Updates
- **Location**: `/features/warehouses/model.ts`
- **New Fields**:
  - `warehouseId` (String, unique, required) - Unique identifier for the warehouse
  - Existing fields: `name`, `location`, `createdAt`, `updatedAt`

#### API Updates
- Enhanced existing warehouse endpoints to include `warehouseId` validation
- Updated search functionality to include `warehouseId` in queries
- Added uniqueness validation for `warehouseId`

#### UI Updates
- **WarehouseTable** - Added `warehouseId` column display
- **AddEditWarehouseDrawer** - Added `warehouseId` field in forms

## Key Features

### 1. Unique Identifiers
Both Outlets and Warehouses now have unique identifiers:
- **Outlet ID**: Format `OUT001`, `OUT002`, etc.
- **Warehouse ID**: Format `WH001`, `WH002`, etc.
- Both use uppercase alphanumeric format
- Validation ensures uniqueness across the system

### 2. Inventory Tracking
- **Outlet Inventory**: Shows products available at each outlet
- **Warehouse Inventory**: Enhanced with warehouse-specific stock levels
- **Statistics**: Real-time calculations of total products, values, and low stock items

### 3. Search and Filtering
- Search by ID, name, or location
- Pagination support
- Sorting by various fields

### 4. CRUD Operations
- Create, Read, Update, Delete operations for both entities
- Form validation with real-time feedback
- Confirmation dialogs for destructive actions

## Implementation Notes

### Simplifications Made

1. **Inventory Integration**: 
   - Outlet inventory currently uses warehouse stock as a placeholder
   - In a production system, you would implement a separate inventory collection that tracks stock per outlet
   - The current implementation shows all products with their warehouse stock levels

2. **Statistics Calculation**:
   - Outlet statistics are simplified and distribute warehouse values equally
   - Real implementation would track actual outlet-specific inventory

3. **Form Validation**:
   - Warehouse ID field is disabled during editing to prevent conflicts
   - Outlet ID field is also disabled during editing

### Database Considerations

1. **Indexes**: Added indexes for `outletId` and `warehouseId` for efficient queries
2. **Uniqueness**: Database-level constraints ensure ID uniqueness
3. **Referential Integrity**: Consider implementing checks before deletion

### Security

1. **Authorization**: All endpoints require authentication
2. **Role-based Access**: Different operations require different permission levels
3. **Input Validation**: Server-side validation for all inputs

## Usage Examples

### Creating an Outlet
```typescript
const newOutlet = {
  outletId: "OUT001",
  name: "Downtown Store"
};
```

### Creating a Warehouse
```typescript
const newWarehouse = {
  warehouseId: "WH001",
  name: "Main Warehouse",
  location: "123 Industrial Blvd"
};
```

### Searching Outlets
```typescript
// Search by ID, name, or location
const searchParams = {
  search: "downtown",
  page: 1,
  limit: 10
};
```

## Future Enhancements

1. **Real Inventory Tracking**: Implement outlet-specific inventory management
2. **Stock Transfers**: Add functionality to transfer stock between outlets and warehouses
3. **Reporting**: Enhanced reporting with outlet-specific metrics
4. **Multi-location Support**: Support for complex multi-location scenarios
5. **Integration**: Integration with POS systems for real-time inventory updates

## File Structure

```
features/
├── outlets/
│   ├── model.ts          # Mongoose schema
│   ├── types.ts          # TypeScript interfaces
│   ├── api.ts            # RTK Query endpoints
│   ├── index.ts          # Exports
│   ├── OutletTable.tsx   # Table component
│   ├── AddEditOutletDrawer.tsx  # Form component
│   └── ViewOutletDrawer.tsx     # Detail view
├── warehouses/
│   ├── model.ts          # Updated schema
│   ├── types.ts          # Updated types
│   ├── service.ts        # Updated service
│   ├── WarehouseTable.tsx       # Updated table
│   └── AddEditWarehouseDrawer.tsx  # Updated form
app/
├── api/
│   ├── outlets/          # Outlet API routes
│   └── warehouses/       # Warehouse API routes
└── dashboard/
    └── outlets/
        └── page.tsx      # Outlets page
```

## Testing

To test the implementation:

1. **Create Outlets**: Use the "Add Outlet" button to create new outlets
2. **Create Warehouses**: Use the warehouse management to create warehouses with IDs
3. **Search**: Test search functionality with different terms
4. **Edit**: Verify that editing works correctly
5. **Delete**: Test deletion with confirmation dialogs

## Dependencies

- **Frontend**: Ant Design, Tailwind CSS, RTK Query
- **Backend**: Next.js API routes, Mongoose
- **Database**: MongoDB
- **State Management**: Redux Toolkit

## Notes

- The implementation follows Next.js 15 conventions
- All components use TypeScript for type safety
- Error handling is implemented throughout the system
- The UI is responsive and follows modern design patterns
- Documentation is included in code comments for maintainability 