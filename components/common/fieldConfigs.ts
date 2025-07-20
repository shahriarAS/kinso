import type { FormField, FilterField } from "./index";

// Common form field configurations
export const commonFormFields = {
  // Basic text fields
  name: (label = "Name"): FormField => ({
    name: "name",
    label,
    type: "input",
    placeholder: `Enter ${label.toLowerCase()}`,
    rules: [{ required: true, message: `Please enter ${label.toLowerCase()}` }],
  }),

  email: (): FormField => ({
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter email address",
    rules: [
      { required: true, message: "Please enter email" },
      { type: "email", message: "Please enter a valid email" },
    ],
  }),

  phone: (): FormField => ({
    name: "phone",
    label: "Phone",
    type: "input",
    placeholder: "Enter phone number",
    rules: [{ required: true, message: "Please enter phone number" }],
  }),

  description: (label = "Description"): FormField => ({
    name: "description",
    label,
    type: "textarea",
    placeholder: `Enter ${label.toLowerCase()}`,
  }),

  notes: (): FormField => ({
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Enter notes",
  }),

  // Status fields
  status: (options: { label: string; value: any }[]): FormField => ({
    name: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    options,
    rules: [{ required: true, message: "Please select status" }],
  }),

  // Common status options
  statusOptions: {
    active: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
    order: [
      { label: "Pending", value: "pending" },
      { label: "Processing", value: "processing" },
      { label: "Shipped", value: "shipped" },
      { label: "Delivered", value: "delivered" },
      { label: "Cancelled", value: "cancelled" },
    ],
    stock: [
      { label: "In Stock", value: "in_stock" },
      { label: "Out of Stock", value: "out_of_stock" },
      { label: "Low Stock", value: "low_stock" },
    ],
  },

  // Address fields
  address: (): FormField[] => [
    {
      name: "street",
      label: "Street Address",
      type: "input",
      placeholder: "Enter street address",
      rules: [{ required: true, message: "Please enter street address" }],
    },
    {
      name: "city",
      label: "City",
      type: "input",
      placeholder: "Enter city",
      rules: [{ required: true, message: "Please enter city" }],
    },
    {
      name: "state",
      label: "State/Province",
      type: "input",
      placeholder: "Enter state or province",
      rules: [{ required: true, message: "Please enter state or province" }],
    },
    {
      name: "zipCode",
      label: "ZIP/Postal Code",
      type: "input",
      placeholder: "Enter ZIP or postal code",
      rules: [{ required: true, message: "Please enter ZIP or postal code" }],
    },
  ],

  // Date fields
  date: (name: string, label: string): FormField => ({
    name,
    label,
    type: "date",
    rules: [{ required: true, message: `Please select ${label.toLowerCase()}` }],
  }),

  // Number fields
  number: (name: string, label: string, placeholder?: string): FormField => ({
    name,
    label,
    type: "number",
    placeholder: placeholder || `Enter ${label.toLowerCase()}`,
    rules: [{ required: true, message: `Please enter ${label.toLowerCase()}` }],
  }),

  // Price fields
  price: (name = "price", label = "Price"): FormField => ({
    name,
    label,
    type: "number",
    placeholder: "Enter price",
    rules: [
      { required: true, message: "Please enter price" },
      { type: "number", min: 0, message: "Price must be positive" },
    ],
  }),

  // Quantity fields
  quantity: (name = "quantity", label = "Quantity"): FormField => ({
    name,
    label,
    type: "number",
    placeholder: "Enter quantity",
    rules: [
      { required: true, message: "Please enter quantity" },
      { type: "number", min: 0, message: "Quantity must be positive" },
    ],
  }),
};

// Common filter field configurations
export const commonFilterFields = {
  // Search field
  search: (placeholder = "Search..."): FilterField => ({
    name: "search",
    label: "Search",
    type: "input",
    placeholder,
    debounce: 500,
  }),

  // Status filter
  status: (options: { label: string; value: any }[], label = "Status"): FilterField => ({
    name: "status",
    label,
    type: "select",
    placeholder: `Select ${label.toLowerCase()}`,
    options: [{ label: "All", value: "" }, ...options],
  }),

  // Date range filter
  dateRange: (name = "dateRange", label = "Date Range"): FilterField => ({
    name,
    label,
    type: "date",
    placeholder: "Select date range",
  }),

  // Price range filter
  priceRange: (): FilterField => ({
    name: "priceRange",
    label: "Price Range",
    type: "range",
    placeholder: "Price range",
  }),

  // Category filter
  category: (options: { label: string; value: any }[]): FilterField => ({
    name: "category",
    label: "Category",
    type: "select",
    placeholder: "Select Category",
    options: [{ label: "All Categories", value: "" }, ...options],
  }),

  // Warehouse filter
  warehouse: (options: { label: string; value: any }[]): FilterField => ({
    name: "warehouse",
    label: "Warehouse",
    type: "select",
    placeholder: "Select Warehouse",
    options: [{ label: "All Warehouses", value: "" }, ...options],
  }),

  // Email filter
  email: (): FilterField => ({
    name: "email",
    label: "Email",
    type: "input",
    placeholder: "Search by email...",
  }),

  // Phone filter
  phone: (): FilterField => ({
    name: "phone",
    label: "Phone",
    type: "input",
    placeholder: "Search by phone...",
  }),
};

// Helper function to create grid layouts
export const createGridLayout = (fields: FormField[], cols: number): FormField[][] => {
  const rows: FormField[][] = [];
  for (let i = 0; i < fields.length; i += cols) {
    rows.push(fields.slice(i, i + cols));
  }
  return rows;
};

// Helper function to create common form configurations
export const createFormConfig = {
  // Product form
  product: (categoryOptions: { label: string; value: any }[]) => [
    commonFormFields.name("Product Name"),
    {
      name: "sku",
      label: "SKU",
      type: "input",
      placeholder: "Enter SKU",
      rules: [{ required: true, message: "Please enter SKU" }],
    },
    {
      name: "upc",
      label: "UPC",
      type: "input",
      placeholder: "Enter UPC",
      rules: [{ required: true, message: "Please enter UPC" }],
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      placeholder: "Select Category",
      options: categoryOptions,
      rules: [{ required: true, message: "Please select a category" }],
    },
    commonFormFields.description("Product Description"),
    commonFormFields.price(),
  ],

  // Customer form
  customer: () => [
    commonFormFields.name("Full Name"),
    commonFormFields.email(),
    commonFormFields.phone(),
    commonFormFields.status(commonFormFields.statusOptions.active),
    commonFormFields.notes(),
  ],

  // Order form
  order: () => [
    {
      name: "orderNumber",
      label: "Order Number",
      type: "input",
      placeholder: "Enter order number",
      rules: [{ required: true, message: "Please enter order number" }],
    },
    commonFormFields.status(commonFormFields.statusOptions.order),
    commonFormFields.date("orderDate", "Order Date"),
    commonFormFields.notes(),
  ],

  // Category form
  category: () => [
    commonFormFields.name("Category Name"),
    commonFormFields.description("Category Description"),
  ],
};

// Helper function to create common filter configurations
export const createFilterConfig = {
  // Product filters
  product: (
    categoryOptions: { label: string; value: any }[],
    warehouseOptions: { label: string; value: any }[]
  ) => [
    commonFilterFields.search("Search products..."),
    commonFilterFields.category(categoryOptions),
    commonFilterFields.warehouse(warehouseOptions),
    commonFilterFields.status(commonFormFields.statusOptions.stock, "Stock Status"),
  ],

  // Customer filters
  customer: () => [
    commonFilterFields.search("Search customers..."),
    commonFilterFields.email(),
    commonFilterFields.phone(),
    commonFilterFields.status(commonFormFields.statusOptions.active),
  ],

  // Order filters
  order: () => [
    commonFilterFields.search("Search orders..."),
    commonFilterFields.status(commonFormFields.statusOptions.order),
    commonFilterFields.dateRange("orderDate", "Order Date"),
  ],
}; 