"use client";

import { Form, Input, Select, DatePicker } from "antd";
import React from "react";

type Props = {};

export default function OrderFilters({}: Props) {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="order-filter"
      layout="vertical"
      requiredMark={false}
      className="border border-gray-300 rounded-3xl p-4 bg-white grid grid-cols-4 gap-8"
    >
      <Form.Item
        name="status"
        label="Status"
        className="font-medium"
      >
        <Select
          size="large"
          placeholder="Select Status"
          options={[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Processing", value: "processing" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
            { label: "Cancelled", value: "cancelled" },
          ]}
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        name="paymentStatus"
        label="Payment Status"
        className="font-medium"
      >
        <Select
          size="large"
          placeholder="Select Payment Status"
          options={[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Failed", value: "failed" },
          ]}
          className="w-full"
        />
      </Form.Item>
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