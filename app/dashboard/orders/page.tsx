"use client";

import { useState } from "react";
import { OrderFilters, OrderTable } from "@/features/orders";

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold">Orders</h1>
      </div>
      {/* Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        paymentMethodFilter={paymentMethodFilter}
        onSearchChange={setSearchTerm}
        onPaymentMethodChange={setPaymentMethodFilter}
        onPageChange={handlePageChange}
        onWarehouseChange={setWarehouseFilter}
        warehouseFilter={warehouseFilter}
        productFilter={productFilter}
        onProductChange={setProductFilter}
      />
      {/* Table */}
      <OrderTable
        searchTerm={searchTerm}
        paymentMethodFilter={paymentMethodFilter}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        warehouseFilter={warehouseFilter}
        productFilter={productFilter}
      />
    </div>
  );
}
