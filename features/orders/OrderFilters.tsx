"use client";
import { Form, Input, Select } from "antd";
import React, { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { PAYMENT_METHODS } from "@/lib/constraints";

interface Props {
  searchTerm: string;
  paymentMethodFilter: string;
  onSearchChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function OrderFilters({
  searchTerm,
  paymentMethodFilter,
  onSearchChange,
  onPaymentMethodChange,
  onPageChange,
}: Props) {
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Reset to first page when filters change
    onPageChange(1);
  }, [debouncedSearch, paymentMethodFilter, onPageChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  return (
    <Form
      form={form}
      name="order-filter"
      layout="vertical"
      requiredMark={false}
      className="border border-gray-300 rounded-3xl p-4 bg-white grid grid-cols-4 gap-8"
    >
      <Form.Item name="search" label="Search" className="font-medium">
        <Input
          size="large"
          placeholder="Search orders..."
          className="w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Form.Item>
      <Form.Item
        name="paymentMethod"
        label="Payment Method"
        className="font-medium"
      >
        <Select
          size="large"
          placeholder="Select Payment Method"
          className="w-full"
          value={paymentMethodFilter}
          onChange={onPaymentMethodChange}
          options={[
            { label: "All", value: "" },
            ...PAYMENT_METHODS.map((method) => ({
              label: method.label,
              value: method.value,
            })),
          ]}
        />
      </Form.Item>
    </Form>
  );
} 