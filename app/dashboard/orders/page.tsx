"use client";

import { useState } from "react";
import OrderFilters from "./OrderFilters";
import OrderTable from "./OrderTable";

interface OrderFiltersType {
  search?: string;
  dateRange?: [string, string];
  paymentMethod?: string;
}

export default function Orders() {
  const [filters, setFilters] = useState<OrderFiltersType>({
    search: "",
    dateRange: undefined,
    paymentMethod: "",
  });
  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    console.log(newFilters);
    setFilters(newFilters);
  };

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold">Orders</h1>
      </div>
      {/* Filters */}
      <OrderFilters onFiltersChange={handleFiltersChange} />
      {/* Table */}
      <OrderTable filters={filters} />
    </div>
  );
}
