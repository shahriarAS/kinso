"use client";
import { useState } from "react";
import {
  AddEditCategoryDrawer,
  CategoryFilters,
  CategoryTable,
} from "@/features/categories";
import { Button } from "antd";
import { Icon } from "@iconify/react";

export default function Category() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-semibold">Categories</h1>
        <Button onClick={() => setOpen(true)} size="large" type="primary">
          <Icon icon="mdi:plus" />
          Add Category
        </Button>
      </div>
      <AddEditCategoryDrawer open={open} setOpen={setOpen} />
      {/* Filters */}
      <CategoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
      />
      {/* Table */}
      <CategoryTable
        searchTerm={searchTerm}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
