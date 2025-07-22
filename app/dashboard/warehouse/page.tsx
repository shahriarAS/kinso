"use client";
import { useState } from "react";
import {
  AddEditWarehouseDrawer,
  WarehouseFilters,
  WarehouseTable,
} from "@/features/warehouses";
import { Button } from "antd";
import { Icon } from "@iconify/react";

export default function Warehouse() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-semibold">Warehouses</h1>
        <Button onClick={() => setOpen(true)} size="large" type="primary">
          <Icon icon="mdi:plus" />
          Add Warehouse
        </Button>
      </div>
      <AddEditWarehouseDrawer open={open} setOpen={setOpen} />
      {/* Filters */}
      <WarehouseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onPageChange={setCurrentPage}
      />
      {/* Table */}
      <WarehouseTable
        searchTerm={searchTerm}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
