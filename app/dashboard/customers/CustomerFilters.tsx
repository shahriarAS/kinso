"use client";

import { Form, Input, Select } from "antd";
import React from "react";

type Props = {};

export default function CustomerFilters({}: Props) {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="customer-filter"
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
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        name="city"
        label="City"
        className="font-medium"
      >
        <Input
          size="large"
          placeholder="Search by city..."
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        name="search"
        label="Search"
        className="font-medium"
      >
        <Input
          size="large"
          placeholder="Search customers..."
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        className="font-medium"
      >
        <Input
          size="large"
          placeholder="Search by email..."
          className="w-full"
        />
      </Form.Item>
    </Form>
  );
} 