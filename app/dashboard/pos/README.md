# Point of Sale (POS) System

## Overview

The POS system is now fully functional with API integration, providing a complete sales workflow for managing transactions.

## Features

### 🏪 Warehouse Management

- **Default Warehouse Selection**: Automatically selects the first available warehouse on load
- **Warehouse Switching**: Users can change warehouses using the dropdown in the header
- **Inventory-Based Products**: Only shows products available in the selected warehouse

### 👥 Customer Management

- **Customer Selection**: Dropdown with search functionality to select existing customers
- **New Customer Creation**: "New" button opens a modal to create customers on-the-fly
- **Walk-in Customer**: Default option for customers without accounts

### 📦 Product Management

- **Real-time Inventory**: Shows current stock levels for each product
- **Stock Indicators**:
  - Green tag for normal stock levels
  - Red tag for low stock (≤5 items)
  - Disabled "Add to Cart" for out-of-stock items
- **Product Search**: Search by product name or SKU or UPC
- **Category Display**: Color-coded category badges

### 🛒 Cart Management

- **Add to Cart**: Click "Add to Cart" button on any product
- **Quantity Control**: +/- buttons to adjust quantities
- **Price Editing**: Direct price input for each item
- **Remove Items**: Remove button for each cart item
- **Real-time Totals**: Automatic calculation of subtotal, tax, and total

### 💰 Pricing & Discounts

- **Custom Pricing**: Edit individual item prices
- **Discount Application**: Apply discounts to the entire order
- **Custom Total**: Override calculated total if needed
- **Tax Calculation**: Automatic 5% tax calculation

### ✅ Checkout Process

- **Order Validation**: Ensures cart has items and customer is selected
- **Confirmation Modal**: Shows order summary before processing
- **Order Creation**: Creates order in the database
- **Cart Reset**: Automatically clears cart after successful checkout

## API Integration

### Warehouses

- `useGetWarehousesQuery`: Fetches all warehouses
- `useGetWarehouseInventoryQuery`: Fetches products in selected warehouse

### Customers

- `useGetCustomersQuery`: Fetches all customers
- `useCreateCustomerMutation`: Creates new customers

### Orders

- `useCreateOrderMutation`: Creates new orders

## Components

### `page.tsx`

Main POS page that orchestrates all functionality:

- Manages state for cart, customer, warehouse selection
- Handles API calls and data transformation
- Coordinates between child components

### `CartDetails.tsx`

Right sidebar showing cart and checkout:

- Displays cart items with quantity/price controls
- Customer selection with search
- Discount and total management
- Checkout process with confirmation modal

### `ProductGrid.tsx`

Product display grid:

- Shows products with stock information
- Category badges and stock indicators
- Add to cart functionality

### `CustomerModal.tsx`

Customer creation modal:

- Form for creating new customers
- Validation and error handling
- Automatic selection after creation

### `types.ts`

Type definitions for the POS system:

- CartItem, CustomerOption, WarehouseOption interfaces
- Category color mappings

## Usage Flow

1. **Select Warehouse**: Choose warehouse from dropdown (auto-selected on load)
2. **Search Products**: Use search bar to find specific products
3. **Add to Cart**: Click "Add to Cart" on desired products
4. **Select Customer**: Choose existing customer or create new one
5. **Adjust Cart**: Modify quantities, prices, or remove items
6. **Apply Discount**: Enter discount amount if needed
7. **Checkout**: Click "Checkout" and confirm order
8. **Complete**: Order is created and cart is reset

## Error Handling

- **Empty Cart**: Prevents checkout with empty cart
- **No Customer**: Requires customer selection before checkout
- **API Errors**: Displays error messages for failed operations
- **Stock Validation**: Prevents adding out-of-stock items

## Future Enhancements

- Payment method selection
- Receipt printing
- Barcode scanning
- Return/refund functionality
- Sales reports integration
- Multi-currency support
