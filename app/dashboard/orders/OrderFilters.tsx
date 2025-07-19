"use client";

import { Form, Input, DatePicker } from "antd";
import React from "react";

interface OrderFiltersProps {
  onFiltersChange?: (filters: {
    search?: string;
    dateRange?: [string, string];
  }) => void;
}

export default function OrderFilters({ onFiltersChange }: OrderFiltersProps) {
  const [form] = Form.useForm();

  const handleValuesChange = (_changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => {
    let dateRange: [string, string] | undefined = undefined;
    if (Array.isArray(allValues.dateRange) && allValues.dateRange.length === 2) {
      dateRange = allValues.dateRange as [string, string];
    }
    const filters = {
      ...allValues,
      dateRange,
    };
    onFiltersChange?.(filters);
  };

  return (
    <Form
      form={form}
      name="order-filter"
      layout="vertical"
      requiredMark={false}
      className="border border-gray-300 rounded-3xl p-4 bg-white grid grid-cols-4 gap-8"
      onValuesChange={handleValuesChange}
    >
      <Form.Item
        name="dateRange"
        label="Order Date Range"
        className="font-medium"
      >
        <DatePicker.RangePicker
          size="large"
          className="w-full"
          placeholder={["Start Date", "End Date"]}
        />
      </Form.Item>
      <Form.Item
        name="search"
        label="Search"
        className="font-medium"
      >
        <Input
          size="large"
          placeholder="Search orders..."
          className="w-full"
        />
      </Form.Item>
    </Form>
  );
} 