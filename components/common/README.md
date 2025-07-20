# Generic Components Documentation

This directory contains reusable, generic components that can be configured via props or schema to handle different data types and use cases. These components reduce code duplication and provide consistent behavior across the application.

## Components Overview

### 1. GenericTable

A configurable table component that handles data display, pagination, sorting, and actions.

### 2. GenericDrawer

A configurable drawer component for forms with built-in validation and submission handling.

### 3. GenericFilters

A configurable filter component with debounced input handling and grid layout support.

## GenericTable

### Features

- ✅ Configurable columns with custom rendering
- ✅ Built-in action buttons (view, edit, delete, custom)
- ✅ Pagination support
- ✅ Loading states and error handling
- ✅ Sorting support
- ✅ Responsive design
- ✅ Sticky headers
- ✅ Custom row actions

### Usage Example

```tsx
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";

// Define columns
const columns: TableColumn<Product>[] = [
  {
    title: <span className="font-medium text-base">Name</span>,
    dataIndex: "name",
    key: "name",
    render: (text: string) => (
      <span className="font-medium text-gray-900">{text}</span>
    ),
  },
  {
    title: <span className="font-medium text-base">Category</span>,
    dataIndex: "category",
    key: "category",
    render: (category: any) => (
      <span className="text-gray-700 capitalize">{category?.name}</span>
    ),
  },
];

// Define actions
const actions: TableAction<Product>[] = [
  {
    key: "view",
    label: "View Product",
    icon: "lineicons:eye",
    type: "view",
    color: "green",
    onClick: handleView,
  },
  {
    key: "edit",
    label: "Edit",
    icon: "lineicons:pencil-1",
    type: "edit",
    color: "blue",
    onClick: handleEdit,
  },
  {
    key: "delete",
    label: "Delete",
    icon: "lineicons:trash-3",
    type: "delete",
    color: "red",
    onClick: handleDelete,
    confirm: {
      title: "Delete Product",
      description: "Are you sure you want to delete this product?",
    },
  },
];

// Use the component
<GenericTable
  data={products}
  loading={isLoading}
  error={error}
  onRetry={refetch}
  columns={columns}
  actions={actions}
  pagination={{
    current: currentPage,
    pageSize,
    total: pagination.total,
    onChange: onPageChange,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  }}
/>;
```

### Props

| Prop         | Type                 | Description                       |
| ------------ | -------------------- | --------------------------------- |
| `data`       | `T[]`                | Array of data to display          |
| `loading`    | `boolean`            | Loading state                     |
| `error`      | `any`                | Error state                       |
| `onRetry`    | `() => void`         | Retry function for error handling |
| `columns`    | `TableColumn<T>[]`   | Column definitions                |
| `actions`    | `TableAction<T>[]`   | Action button definitions         |
| `pagination` | `object`             | Pagination configuration          |
| `rowKey`     | `string \| function` | Unique key for rows               |
| `scroll`     | `object`             | Scroll configuration              |
| `sticky`     | `boolean`            | Enable sticky headers             |
| `className`  | `string`             | Custom CSS classes                |
| `maxHeight`  | `number`             | Maximum height of table           |

## GenericDrawer

### Features

- ✅ Configurable form fields
- ✅ Built-in validation
- ✅ Grid layout support
- ✅ Custom field types
- ✅ Loading states
- ✅ Form reset on close

### Usage Example

```tsx
import { GenericDrawer, type FormField } from "@/components/common";
import { Form } from "antd";

const [form] = Form.useForm<ProductInput>();

// Define form fields
const fields: FormField[] = [
  {
    name: "name",
    label: "Product Name",
    type: "input",
    placeholder: "Enter Product Name",
    rules: [{ required: true, message: "Please enter product name" }],
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    placeholder: "Select Category",
    options: categoryOptions,
    rules: [{ required: true, message: "Please select a category" }],
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
  },
];

// Use the component
<GenericDrawer
  open={open}
  onClose={handleClose}
  title="Add New Product"
  width={800}
  form={form}
  fields={fields}
  initialValues={initialValues}
  onSubmit={handleSubmit}
  submitText="Save"
  loading={isLoading}
  gridCols={2}
>
  {/* Custom content can be added here */}
  <div className="mt-6">
    <StockEntries form={form} warehouseOptions={warehouseOptions} />
  </div>
</GenericDrawer>;
```

### Supported Field Types

- `input` - Text input
- `textarea` - Multi-line text input
- `select` - Dropdown selection
- `number` - Numeric input
- `email` - Email input
- `password` - Password input
- `date` - Date picker
- `custom` - Custom component

### Props

| Prop            | Type                  | Description                      |
| --------------- | --------------------- | -------------------------------- |
| `open`          | `boolean`             | Drawer visibility                |
| `onClose`       | `() => void`          | Close handler                    |
| `title`         | `string`              | Drawer title                     |
| `width`         | `number`              | Drawer width                     |
| `form`          | `FormInstance<T>`     | Ant Design form instance         |
| `fields`        | `FormField[]`         | Form field definitions           |
| `initialValues` | `Partial<T>`          | Initial form values              |
| `onSubmit`      | `(values: T) => void` | Form submission handler          |
| `submitText`    | `string`              | Submit button text               |
| `loading`       | `boolean`             | Loading state                    |
| `gridCols`      | `number`              | Number of columns in grid layout |

## GenericFilters

### Features

- ✅ Configurable filter fields
- ✅ Debounced input handling
- ✅ Grid layout support
- ✅ Reset functionality
- ✅ Multiple field types

### Usage Example

```tsx
import { GenericFilters, type FilterField } from "@/components/common";

// Define filter fields
const fields: FilterField[] = [
  {
    name: "search",
    label: "Search",
    type: "input",
    placeholder: "Search products...",
    debounce: 500,
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    placeholder: "Select Category",
    options: [{ label: "All Categories", value: "" }, ...categoryOptions],
  },
  {
    name: "priceRange",
    label: "Price Range",
    type: "range",
    placeholder: "Price range",
  },
];

// Use the component
<GenericFilters
  fields={fields}
  initialValues={initialValues}
  onFiltersChange={handleFiltersChange}
  gridCols={4}
  debounceDelay={500}
  showReset={true}
  resetText="Clear Filters"
  onReset={handleReset}
/>;
```

### Supported Field Types

- `input` - Text input with debouncing
- `select` - Dropdown selection
- `date` - Date picker
- `number` - Numeric input
- `range` - Range input (min/max)
- `custom` - Custom component

### Props

| Prop              | Type                   | Description               |
| ----------------- | ---------------------- | ------------------------- |
| `fields`          | `FilterField[]`        | Filter field definitions  |
| `initialValues`   | `Partial<T>`           | Initial filter values     |
| `onFiltersChange` | `(filters: T) => void` | Filter change handler     |
| `gridCols`        | `number`               | Number of columns in grid |
| `className`       | `string`               | Custom CSS classes        |
| `showReset`       | `boolean`              | Show reset button         |
| `resetText`       | `string`               | Reset button text         |
| `onReset`         | `() => void`           | Reset handler             |
| `debounceDelay`   | `number`               | Debounce delay in ms      |

## Migration Guide

### From ProductTable to GenericTable

**Before:**

```tsx
// 245 lines of repetitive table code
const columns = [
  // ... column definitions
];

return (
  <div className="bg-white border border-gray-300 rounded-3xl shadow-lg overflow-hidden flex flex-col">
    <div className="overflow-x-auto custom-scrollbar flex-1">
      <Table
        columns={columns}
        dataSource={products}
        rowKey="_id"
        className="min-w-[700px] !bg-white"
        scroll={{ x: "100%" }}
        pagination={false}
        loading={isLoading}
        sticky
      />
    </div>
    {/* Pagination and action buttons */}
  </div>
);
```

**After:**

```tsx
// 50 lines of clean, reusable code
const columns: TableColumn<Product>[] = [
  // ... column definitions
];

const actions: TableAction<Product>[] = [
  // ... action definitions
];

return (
  <GenericTable
    data={products}
    loading={isLoading}
    error={error}
    onRetry={refetch}
    columns={columns}
    actions={actions}
    pagination={paginationConfig}
  />
);
```

### Benefits

1. **Reduced Code Duplication**: ~70% reduction in table-related code
2. **Consistent Behavior**: All tables have the same look, feel, and functionality
3. **Type Safety**: Full TypeScript support with generic types
4. **Maintainability**: Changes to table behavior only need to be made in one place
5. **Extensibility**: Easy to add new features to all tables at once
6. **Performance**: Optimized rendering and state management

### Best Practices

1. **Use TypeScript**: Always define proper types for your data
2. **Consistent Naming**: Use consistent naming conventions for actions and fields
3. **Error Handling**: Always provide error handling and retry functionality
4. **Loading States**: Show appropriate loading states for better UX
5. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
6. **Responsive Design**: Test on different screen sizes

### Customization

All components support extensive customization through props and CSS classes. You can:

- Override default styles with custom CSS classes
- Add custom field types and components
- Extend the base interfaces for additional functionality
- Use the `children` prop for custom content
- Configure grid layouts and responsive behavior

## Examples

See the following files for complete examples:

- `features/products/ProductTableRefactored.tsx`
- `features/products/ProductFiltersRefactored.tsx`
- `features/products/AddEditProductDrawerRefactored.tsx`
