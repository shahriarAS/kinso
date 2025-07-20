"use client";
import { useEffect } from "react";
import { GenericFilters, type FilterField } from "@/components/common";
import { useGetAllCategoriesQuery } from "@/features/categories/api";
import { useGetWarehousesQuery } from "@/features/warehouses";

interface ProductFilters {
  search?: string;
  category?: string;
  warehouse?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface Props {
  searchTerm: string;
  categoryFilter: string;
  warehouseFilter: string;
  statusFilter: string;
  minPrice: string;
  maxPrice: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onWarehouseChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function ProductFiltersRefactored({
  searchTerm,
  categoryFilter,
  warehouseFilter,
  statusFilter,
  minPrice,
  maxPrice,
  onSearchChange,
  onCategoryChange,
  onWarehouseChange,
  onStatusChange,
  onMinPriceChange,
  onMaxPriceChange,
  onPageChange,
}: Props) {
  // API hooks
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: warehousesData } = useGetWarehousesQuery({});

  const categoryOptions =
    categoriesData?.data?.map((cat: { name: string; _id: string }) => ({
      label: cat.name,
      value: cat._id,
    })) || [];

  const warehouseOptions =
    warehousesData?.data?.map((warehouse) => ({
      label: warehouse.name,
      value: warehouse._id,
    })) || [];

  // Define filter fields using the generic interface
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
      name: "warehouse",
      label: "Warehouse",
      type: "select",
      placeholder: "Select Warehouse",
      options: [{ label: "All Warehouses", value: "" }, ...warehouseOptions],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select Status",
      options: [
        { label: "All", value: "" },
        { label: "In Stock", value: "in_stock" },
        { label: "Out of Stock", value: "out_of_stock" },
        { label: "Low Stock", value: "low_stock" },
      ],
    },
  ];

  const handleFiltersChange = (filters: ProductFilters) => {
    // Reset to first page when filters change
    onPageChange(1);
    
    // Update individual filter values
    if (filters.search !== undefined) {
      onSearchChange(filters.search);
    }
    if (filters.category !== undefined) {
      onCategoryChange(filters.category);
    }
    if (filters.warehouse !== undefined) {
      onWarehouseChange(filters.warehouse);
    }
    if (filters.status !== undefined) {
      onStatusChange(filters.status);
    }
  };

  const initialValues = {
    search: searchTerm,
    category: categoryFilter,
    warehouse: warehouseFilter,
    status: statusFilter,
  };

  return (
    <GenericFilters
      fields={fields}
      initialValues={initialValues}
      onFiltersChange={handleFiltersChange}
      gridCols={4}
      debounceDelay={500}
    />
  );
} 