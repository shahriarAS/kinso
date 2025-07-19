"use client";
import { useState } from "react";
import AddEditProductDrawer from "./AddEditProductDrawer";
import InventoryFilters from "./InventoryFilters";
import InventoryTable from "./InventoryTable";
import { Button } from "antd";
import { Icon } from "@iconify/react";

export default function Inventory() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-semibold">Inventory</h1>
        <Button onClick={() => setOpen(true)} size="large" type="primary">
          <Icon icon="mdi:plus" />
          Add Product
        </Button>
      </div>
      <AddEditProductDrawer open={open} setOpen={setOpen} />
      {/* Filters */}
      <InventoryFilters
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        warehouseFilter={warehouseFilter}
        statusFilter={statusFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategoryFilter}
        onWarehouseChange={setWarehouseFilter}
        onStatusChange={setStatusFilter}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onPageChange={setCurrentPage}
      />
      {/* Table */}
      <InventoryTable
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        warehouseFilter={warehouseFilter}
        statusFilter={statusFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}