# Stock Management Feature

A comprehensive stock management system for tracking inventory across warehouses and outlets with FIFO (First In, First Out) logic.

## Features

- **Stock Tracking**: Track stock with product, location, pricing, expiry dates, and units
- **FIFO Logic**: Automatic first-in-first-out stock management for accurate inventory tracking
- **Location Management**: Support for both warehouses and outlets
- **Stock Movement**: Move stock between warehouses and outlets
- **Expiry Tracking**: Monitor and alert on expiring stock
- **Low Stock Alerts**: Identify items with low inventory
- **Statistics Dashboard**: Overview of total stock, value, and distribution
- **Advanced Filtering**: Search and filter by product, location, dates, and status

## Schema

### Stock Model
```typescript
{
  productId: ObjectId,      // Reference to Product
  outletId?: ObjectId,      // Reference to Outlet (nullable)
  warehouseId?: String,     // Warehouse ID (nullable)
  mrp: Number,              // Maximum Retail Price
  tp: Number,               // Trade Price
  expireDate: Date,         // Expiry date
  units: Number,            // Number of units
  entryDate: Date,          // Date stock was added
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### GET /api/stock
- List all stock with pagination and filters
- Supports search, date ranges, location filters
- Returns stock data with populated product and location information

### POST /api/stock
- Add new stock entry
- Validates product, location, pricing, and expiry date
- Ensures either outlet or warehouse is specified (not both)

### POST /api/stock/move
- Move stock between locations
- Implements FIFO logic for accurate tracking
- Validates sufficient stock availability

### GET /api/stock/stats
- Get stock statistics and overview
- Returns total stock, value, low stock items, expiring items
- Provides breakdown by warehouse and outlet

## Components

### AddStockDrawer
- Form for adding new stock entries
- Product selection with search
- Location type selection (warehouse/outlet)
- Pricing and expiry date inputs
- Validation for all required fields

### MoveStockDrawer
- Interface for moving stock between locations
- Shows current stock details
- Target location selection
- Units to move with validation
- FIFO-based movement logic

### StockTable
- Displays stock inventory in table format
- Status indicators (expired, expiring soon, low stock)
- Action buttons for move, edit, delete
- Responsive design with horizontal scroll

### StockFilters
- Advanced filtering options
- Search by product name/barcode
- Filter by location, date ranges
- Quick filters for low stock and expiring items

### StockStats
- Statistics dashboard with cards
- Total stock count and value
- Low stock and expiring items alerts
- Stock distribution by location

## Usage

### Adding Stock
1. Click "Add Stock" button
2. Select product from dropdown
3. Choose location type (warehouse or outlet)
4. Select specific location
5. Enter MRP, TP, units, and expiry date
6. Submit to create stock entry

### Moving Stock
1. Click move icon on any stock entry
2. Review current stock details
3. Select target location type and specific location
4. Enter units to move (cannot exceed available)
5. Submit to move stock with FIFO logic

### Filtering and Search
1. Use search box for product name/barcode
2. Select specific product, outlet, or warehouse
3. Set date ranges for expiry or entry dates
4. Use quick filters for low stock or expiring items
5. Reset filters to clear all selections

## Validation Rules

- **Product**: Must exist in database
- **Location**: Either outlet or warehouse must be specified (not both)
- **Pricing**: MRP and TP must be positive numbers
- **Units**: Must be at least 1
- **Expiry Date**: Must be in the future
- **Stock Movement**: Cannot move more units than available

## FIFO Implementation

The system implements First In, First Out logic for stock management:

1. **Stock Addition**: New stock entries are created with current timestamp
2. **Stock Movement**: When moving stock, oldest entries are used first
3. **Stock Consumption**: When stock is used, oldest entries are consumed first
4. **Tracking**: Entry dates are maintained for accurate FIFO tracking

## Notifications

- Success messages for stock operations
- Error messages for validation failures
- Toast notifications for user feedback
- Loading states for async operations

## Integration

The stock management system integrates with:
- **Products**: For product information and validation
- **Warehouses**: For warehouse location management
- **Outlets**: For outlet location management
- **Dashboard**: For stock statistics and alerts
- **Orders**: For stock consumption tracking (future enhancement)

## Future Enhancements

- Stock consumption tracking
- Automatic reorder points
- Batch operations
- Stock history and audit trail
- Barcode scanning integration
- Mobile app support 