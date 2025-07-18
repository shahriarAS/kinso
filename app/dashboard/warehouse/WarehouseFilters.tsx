"use client";
import { Form, Input } from "antd";
import React from "react";

type Props = {};

export default function WarehouseFilters({}: Props) {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="warehouse-filter"
      layout="vertical"
      requiredMark={false}
      className="border border-gray-300 rounded-3xl p-4 bg-white grid grid-cols-4 gap-8"
    >
      <Form.Item
        name="search"
        label="Search"
        className="font-medium"
      >
        <Input
          size="large"
          placeholder="Search warehouses..."
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        name="location"
        label="Location"
        className="font-medium"
      >
        <Input
          size="large"
          placeholder="Location"
          className="w-full"
        />
      </Form.Item>
    </Form>
  );
} 