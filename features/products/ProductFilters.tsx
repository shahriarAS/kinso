"use client";
import { Input, Select, Button } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useGetAllCategoriesQuery } from "@/features/categories/api";
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
  onReset?: () => void;
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
  onReset,
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

  const handleReset = () => {
    onSearchChange("");
    onCategoryChange("");
    onBrandChange("");
    onVendorChange("");
    onPageChange(1);
    if (onReset) onReset();
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FilterOutlined className="mr-2" />
          Product Filters
        </h3>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          className="flex items-center"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            size="large"
            allowClear
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <Select
            placeholder="Filter by category"
            allowClear
            size="large"
            style={{ width: "100%" }}
            onChange={handleCategoryFilter}
            value={categoryFilter || undefined}
          >
            {categoriesData?.data?.map((category) => (
              <Option key={category._id} value={category._id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand
          </label>
          <Select
            placeholder="Filter by brand"
            allowClear
            size="large"
            style={{ width: "100%" }}
            onChange={handleBrandFilter}
            value={brandFilter || undefined}
          >
            {brandsData?.data?.map((brand) => (
              <Option key={brand._id} value={brand._id}>
                {brand.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vendor
          </label>
          <Select
            placeholder="Filter by vendor"
            allowClear
            size="large"
            style={{ width: "100%" }}
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
    </div>
  );
}
