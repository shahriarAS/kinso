"use client";
import React, { useCallback } from "react";
import { Input, Button } from "antd";
import { SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";

interface WarehouseFilters {
  search?: string;
  location?: string;
}

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function WarehouseFilters({
  searchTerm,
  onSearchChange,
  onPageChange,
}: Props) {
  const handleSearch = useCallback(
    (value: string) => {
      const searchChanged = value !== searchTerm;
      if (searchChanged) {
        onPageChange(1);
      }
      onSearchChange(value);
    },
    [onPageChange, onSearchChange, searchTerm],
  );

  const handleReset = useCallback(() => {
    onSearchChange("");
    onPageChange(1);
  }, [onSearchChange, onPageChange]);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FilterOutlined className="mr-2" />
          Warehouse Filters
        </h3>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          className="flex items-center"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <Input
            placeholder="Search warehouses..."
            prefix={<SearchOutlined />}
            size="large"
            allowClear
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <Input
            placeholder="Location"
            size="large"
            allowClear
          />
        </div>
      </div>
    </div>
  );
}
