"use client";
import { Input, Select } from "antd";
import React, { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetAllCategoriesQuery } from "@/store/api/categories";
import { useGetWarehousesQuery } from "@/store/api/warehouses";

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

export default function InventoryFilters({
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
  const debouncedSearch = useDebounce(searchTerm, 500);

  // API hooks
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: warehousesData } = useGetWarehousesQuery({});

  useEffect(() => {
    // Reset to first page when filters change
    onPageChange(1);
  }, [
    debouncedSearch,
    categoryFilter,
    warehouseFilter,
    statusFilter,
    minPrice,
    maxPrice,
    onPageChange,
  ]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

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

  return (
    <div className="border border-gray-300 rounded-3xl p-4 bg-white grid grid-cols-4 gap-8">
      <div className="flex flex-col">
        <label className="font-medium mb-2">Search</label>
        <Input
          size="large"
          placeholder="Search products..."
          className="w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium mb-2">Category</label>
        <Select
          size="large"
          placeholder="Select Category"
          options={[{ label: "All Categories", value: "" }, ...categoryOptions]}
          value={categoryFilter}
          onChange={onCategoryChange}
          className="w-full"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium mb-2">Warehouse</label>
        <Select
          size="large"
          placeholder="Select Warehouse"
          options={[
            { label: "All Warehouses", value: "" },
            ...warehouseOptions,
          ]}
          value={warehouseFilter}
          onChange={onWarehouseChange}
          className="w-full"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium mb-2">Status</label>
        <Select
          size="large"
          placeholder="Select Status"
          options={[
            { label: "All", value: "" },
            { label: "In Stock", value: "in_stock" },
            { label: "Out of Stock", value: "out_of_stock" },
            { label: "Low Stock", value: "low_stock" },
          ]}
          value={statusFilter}
          onChange={onStatusChange}
          className="w-full"
        />
      </div>

      {/* <div className="flex flex-col">
        <label className="font-medium mb-2">Price Range</label>
        <div className="flex gap-2">
          <Input
            size="large"
            type="number"
            placeholder="Min"
            className="w-1/2"
            min={0}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
          />
          <span className="self-center">-</span>
          <Input
            size="large"
            type="number"
            placeholder="Max"
            className="w-1/2"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
          />
        </div>
      </div> */}
    </div>
  );
}
