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
  customerFilter: string;
  setCustomerFilter: (value: string) => void;
  productFilter: string;
  setProductFilter: (value: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange: (key: keyof SalesHistoryFilters, value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDateRangeChange: (dates: any) => void;
  outletsData?: { data?: Array<{ _id: string; name: string }> };
  customersData?: {
    data?: Array<{ _id: string; name: string; email?: string }>;
  };
  productsData?: {
    data?: Array<{ _id: string; name: string; barcode: string }>;
  };
}

export default function SalesFilters({
  searchTerm,
  setSearchTerm,
  paymentMethodFilter,
  setPaymentMethodFilter,
  outletFilter,
  setOutletFilter,
  customerFilter,
  setCustomerFilter,
  productFilter,
  setProductFilter,
  onFilterChange,
  onDateRangeChange,
  outletsData,
  customersData,
  productsData,
}: SalesFiltersProps) {
  return (
    <Card className="border border-gray-200">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div>
          <label className="block mb-1 text-sm font-medium">Search</label>
          <Input
            placeholder="Search sales..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onFilterChange("search", e.target.value);
            }}
            allowClear
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Payment Method
          </label>
          <Select
            placeholder="Select Payment Method"
            value={paymentMethodFilter}
            onChange={(value) => {
              setPaymentMethodFilter(value);
              onFilterChange("paymentMethod", value);
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
          <label className="block mb-1 text-sm font-medium">Outlet</label>
          <Select
            placeholder="Select Outlet"
            value={outletFilter}
            onChange={(value) => {
              setOutletFilter(value);
              onFilterChange("outlet", value);
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
          <label className="block mb-1 text-sm font-medium">Customer</label>
          <Select
            placeholder="Select Customer"
            value={customerFilter}
            onChange={(value) => {
              setCustomerFilter(value);
              onFilterChange("customer", value);
            }}
            className="w-full"
            allowClear
            showSearch
            filterOption={(input, option) =>
              option?.label
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase()) || false
            }
          >
            {customersData?.data?.map((customer) => (
              <Select.Option key={customer._id} value={customer._id}>
                {customer.name} {customer.email && `(${customer.email})`}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Product</label>
          <Select
            placeholder="Select Product"
            value={productFilter}
            onChange={(value) => {
              setProductFilter(value);
              onFilterChange("product", value);
            }}
            className="w-full"
            allowClear
            showSearch
            filterOption={(input, option) =>
              option?.label
                ?.toString()
                .toLowerCase()
                .includes(input.toLowerCase()) || false
            }
          >
            {productsData?.data?.map((product) => (
              <Select.Option key={product._id} value={product._id}>
                {product.name} {product.barcode && `(${product.barcode})`}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Date Range</label>
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
