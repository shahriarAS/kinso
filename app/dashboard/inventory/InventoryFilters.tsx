"use client";

import { Form, Input, Select } from "antd";
import React from "react";

type Props = {};

export default function InventoryFilters({}: Props) {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      name="product-add"
      layout="vertical"
      requiredMark={false}
      className="border border-gray-300 rounded-3xl p-4 bg-white grid grid-cols-4 gap-8"
    >
      <Form.Item
        name="category"
        label="Category"
        rules={[
          { required: true, message: "Please select a category" },
        ]}
        className="font-medium"
      >
        <Select
          size="large"
          placeholder="Select Category"
          options={[
            { label: "Electronics", value: "electronics" },
            { label: "Clothing", value: "clothing" },
            { label: "Food", value: "food" },
          ]}
          className="w-full"
        />
      </Form.Item>
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
            { label: "In Stock", value: "in_stock" },
            { label: "Out of Stock", value: "out_of_stock" },
            { label: "Discontinued", value: "discontinued" },
          ]}
          className="w-full"
        />
      </Form.Item>
      <Form.Item
        label="Price Range"
        className="font-medium"
        style={{ marginBottom: 0 }}
      >
        <div className="flex gap-2">
          <Form.Item
            name="minPrice"
            noStyle
            className="w-1/2"
          >
            <Input
              size="large"
              type="number"
              placeholder="Min"
              className="w-full"
              min={0}
            />
          </Form.Item>
          <span className="self-center">-</span>
          <Form.Item
            name="maxPrice"
            noStyle
            className="w-1/2"
          >
            <Input
              size="large"
              type="number"
              placeholder="Max"
              className="w-full"
              min={0}
            />
          </Form.Item>
        </div>
      </Form.Item>
      <Form.Item
        name="search"
        label="Search"
        className="font-medium"
      >
        <Input
          size="large"
          placeholder="Search products..."
          className="w-full"
        />
      </Form.Item>
    </Form>
  );
}
