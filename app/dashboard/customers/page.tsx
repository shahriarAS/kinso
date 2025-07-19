"use client";

import { useState } from "react";
import AddEditCustomerDrawer from "./AddEditCustomerDrawer";
import CustomerFilters from "./CustomerFilters";
import CustomerTable from "./CustomerTable";
import { Button } from "antd";
import { Icon } from "@iconify/react";

interface CustomerFilters {
  search?: string;
  status?: "active" | "inactive";
  email?: string;
}

export default function Customers() {
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    status: undefined,
    email: "",
  });
  const [open, setOpen] = useState(false);
  const handleFiltersChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold">Customers</h1>
        <Button
          onClick={() => setOpen(true)}
          size="large"
          type="primary"
          icon={<Icon icon="mdi:plus" />}
        >
          Add Customer
        </Button>
      </div>
      <AddEditCustomerDrawer open={open} setOpen={setOpen} />
      {/* Filters */}
      <CustomerFilters onFiltersChange={handleFiltersChange} />
      {/* Table */}
      <CustomerTable filters={filters} />
    </div>
  );
}
