"use client";
import { Form, Input } from "antd";
import React, { useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function CategoryFilters({ searchTerm, onSearchChange, onPageChange }: Props) {
  const [form] = Form.useForm();
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Reset to first page when search changes
    onPageChange(1);
  }, [debouncedSearch, onPageChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  return (
    <Form
      form={form}
      name="category-filter"
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
          placeholder="Search categories..."
          className="w-full"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Form.Item>
    </Form>
  );
} 