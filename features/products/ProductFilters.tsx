"use client";
import React from "react";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useGetAllCategoriesQuery } from "@/features/categories/api";
import { useGetWarehousesQuery } from "@/features/warehouses";
import { useGetAllBrandsQuery } from "../brands";
import { useGetAllVendorsQuery } from "../vendors";

const { Search } = Input;
const { Option } = Select;

interface Props {
  searchTerm: string;
  categoryFilter: string;
  brandFilter: string;
  vendorFilter: string;
  minPrice: string;
  maxPrice: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function ProductFilters({
  searchTerm,
  categoryFilter,
  brandFilter,
  vendorFilter,
  onSearchChange,
  onCategoryChange,
  onBrandChange,
  onVendorChange,
  onPageChange,
}: Props) {
  // API hooks
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: brandsData } = useGetAllBrandsQuery();
  const { data: vendorsData } = useGetAllVendorsQuery();

  const handleSearch = (value: string) => {
    onSearchChange(value);
    onPageChange(1);
  };

  const handleCategoryFilter = (value: string) => {
    onCategoryChange(value);
    onPageChange(1);
  };

  const handleBrandFilter = (value: string) => {
    onBrandChange(value);
    onPageChange(1);
  };

  const handleVendorFilter = (value: string) => {
    onVendorChange(value);
    onPageChange(1);
  };
  return (
    <div className="flex justify-between items-center space-x-4">
      <Search
        placeholder="Search products..."
        allowClear
        enterButton={<SearchOutlined />}
        size="large"
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        value={searchTerm}
        className="flex-1 max-w-md"
      />
      <div className="flex space-x-4">
        <Select
          placeholder="Filter by category"
          allowClear
          size="large"
          style={{ width: 200 }}
          onChange={handleCategoryFilter}
          value={categoryFilter || undefined}
        >
          {categoriesData?.data?.map((category) => (
            <Option key={category._id} value={category._id}>
              {category.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Filter by brand"
          allowClear
          size="large"
          style={{ width: 200 }}
          onChange={handleBrandFilter}
          value={brandFilter || undefined}
        >
          {brandsData?.data?.map((brand) => (
            <Option key={brand._id} value={brand._id}>
              {brand.name}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="Filter by vendor"
          allowClear
          size="large"
          style={{ width: 200 }}
          onChange={handleVendorFilter}
          value={vendorFilter || undefined}
        >
          {vendorsData?.data?.map((vendor) => (
            <Option key={vendor._id} value={vendor._id}>
              {vendor.name}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
}
