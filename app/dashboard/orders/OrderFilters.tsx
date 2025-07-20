"use client";
import { PAYMENT_METHODS } from "@/lib/constraints";
import { Form, Input, Select } from "antd";

interface OrderFiltersProps {
  onFiltersChange?: (filters: {
    search?: string;
    dateRange?: [string, string];
    paymentMethod?: string;
  }) => void;
}

export default function OrderFilters({ onFiltersChange }: OrderFiltersProps) {
  const [form] = Form.useForm();

  const handleValuesChange = (
    _changedValues: Record<string, unknown>,
    allValues: Record<string, unknown>,
  ) => {
    let dateRange: [string, string] | undefined = undefined;
    if (
      Array.isArray(allValues.dateRange) &&
      allValues.dateRange.length === 2
    ) {
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
      {/* <Form.Item
        name="dateRange"
        label="Order Date Range"
        className="font-medium"
      >
        <DatePicker.RangePicker
          size="large"
          className="w-full"
          placeholder={["Start Date", "End Date"]}
        />
      </Form.Item> */}
      <Form.Item name="search" label="Search" className="font-medium">
        <Input size="large" placeholder="Search orders..." className="w-full" />
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
          options={[
            {
              label: "All",
              value: "",
            },
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
