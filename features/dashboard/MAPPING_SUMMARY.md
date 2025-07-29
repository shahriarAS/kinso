# Dashboard Module Mapping Summary

## Architecture Overview

The dashboard module follows a clean architecture pattern with proper separation of concerns:

```
Dashboard Component → API Layer → Service Layer → Database Models
```

## File Structure and Responsibilities

### 1. **Types (`types.ts`)**

- `RecentSale`: Structure for individual sales in recent sales list
- `TopProduct`: Structure for products in top products list
- `DashboardStats`: Main dashboard statistics interface
- `InventoryAlerts`: Low stock, out of stock, and expiring products
- `SalesAnalytics`: Sales performance analytics over time periods

### 2. **API Layer (`api.ts`)**

- `useGetDashboardStatsQuery`: Fetch main dashboard statistics
- `useGetSalesAnalyticsQuery`: Fetch sales analytics with date ranges
- `useGetInventoryAlertsQuery`: Fetch inventory alert data

### 3. **Service Layer (`service.ts`)**

- `handleGetStats`: Core dashboard statistics service
- `handleGetInventoryAlerts`: Inventory alerts service
- `handleGetSalesAnalytics`: Sales analytics service

### 4. **API Routes**

- `/api/dashboard/stats` → `handleGetStats`
- `/api/dashboard/inventory-alerts` → `handleGetInventoryAlerts`
- `/api/dashboard/sales-analytics` → `handleGetSalesAnalytics`

## Data Flow Mapping

### Recent Sales Data Flow

1. **Service (`handleGetStats`)**:

   ```typescript
   Sale.find()
     .populate("customer", "name")
     .select("_id saleId customer totalAmount paymentMethods status createdAt");
   ```

2. **Type (`RecentSale`)**:

   ```typescript
   {
     _id: string;
     saleId: string;
     customerName: string;
     totalAmount: number;
     paymentMethods: Array<{ method: string; amount: number }>;
     status: string;
     createdAt: string;
   }
   ```

3. **Component (`RecentSales.tsx`)**:
   - Displays sales in table format
   - Calculates paid/due amounts from paymentMethods
   - Shows status with color-coded tags
   - Handles fallback for missing customer names

### Dashboard Stats Mapping

**Service Output** → **Type Interface** → **Component Usage**

```typescript
// Service generates:
{
  totalRevenue: number,
  totalSales: number,
  totalCustomers: number,
  totalProducts: number,
  pendingSales: number,
  lowStockProducts: number,
  recentSales: RecentSale[],
  topProducts: TopProduct[],
  revenueChart: RevenueChartPoint[]
}

// Used in Dashboard component as:
const stats: DashboardStats = dashboardStats?.data || defaultStats;
```

## Key Improvements Made

### 1. **Type Consistency**

- Fixed `saleNumber` → `saleId` naming mismatch
- Added proper typing for all service responses
- Made API parameters optional with defaults

### 2. **Error Handling**

- Added try-catch blocks in service layer
- Graceful fallbacks for missing data
- Console error logging for debugging

### 3. **Data Population**

- Proper customer name population using Mongoose populate
- Fallback to "Walk-in Customer" for missing customer data
- Status field handling with defaults

### 4. **Component Enhancements**

- Added status column with color-coded tags
- Improved formatting for sale IDs and customer names
- Better visual hierarchy with proper spacing

### 5. **API Flexibility**

- Optional parameters for all queries
- Configurable thresholds for low stock alerts
- Date range filtering capabilities

## Usage Examples

### Basic Dashboard Usage

```typescript
const Dashboard: React.FC = () => {
  const { data: dashboardStats, isLoading, error } = useGetDashboardStatsQuery({});

  return (
    <div>
      <StatsCards stats={dashboardStats?.data} />
      <RecentSales recentSales={dashboardStats?.data?.recentSales} />
    </div>
  );
};
```

### With Custom Parameters

```typescript
const { data } = useGetDashboardStatsQuery({
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  threshold: 10, // Low stock threshold
});
```

## Error Boundaries

All services include proper error handling:

- Database connection errors
- Data population failures
- Aggregation pipeline errors
- Graceful degradation with fallback data

## Performance Considerations

- Efficient MongoDB aggregation pipelines
- Limited result sets (5 recent sales, 5 top products)
- Proper indexing on frequently queried fields
- Lean queries to reduce memory usage

This mapping ensures type safety, proper error handling, and maintainable code structure throughout the dashboard module.
