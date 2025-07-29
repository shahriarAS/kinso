"use client";

import { Card, Select, DatePicker, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { SalesHistoryFilters } from "@/features/sales";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/constraints";

const { RangePicker } = DatePicker;

interface SalesFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (value: string) => void;
  outletFilter: string;
  setOutletFilter: (value: string) => void;
  onFilterChange: (key: keyof SalesHistoryFilters, value: any) => void;
  onDateRangeChange: (dates: any) => void;
  outletsData?: { data?: Array<{ _id: string; name: string }> };
}

export default function SalesFilters({
  searchTerm,
  setSearchTerm,
  paymentMethodFilter,
  setPaymentMethodFilter,
  outletFilter,
  setOutletFilter,
  onFilterChange,
  onDateRangeChange,
  outletsData,
}: SalesFiltersProps) {
  return (
    <Card className="shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <Input
            placeholder="Search sales..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onFilterChange('search', e.target.value);
            }}
            allowClear
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Payment Method</label>
          <Select
            placeholder="Select Payment Method"
            value={paymentMethodFilter}
            onChange={(value) => {
              setPaymentMethodFilter(value);
              onFilterChange('paymentMethod', value);
            }}
            className="w-full"
            allowClear
          >
            {PAYMENT_METHOD_OPTIONS.map((method) => (
              <Select.Option key={method.value} value={method.value}>
                {method.label}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Outlet</label>
          <Select
            placeholder="Select Outlet"
            value={outletFilter}
            onChange={(value) => {
              setOutletFilter(value);
              onFilterChange('outlet', value);
            }}
            className="w-full"
            allowClear
          >
            {outletsData?.data?.map((outlet) => (
              <Select.Option key={outlet._id} value={outlet._id}>
                {outlet.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date Range</label>
          <RangePicker
            onChange={onDateRangeChange}
            className="w-full"
            format="YYYY-MM-DD"
          />
        </div>
      </div>
    </Card>
  );
}
