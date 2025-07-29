"use client";
import { useState } from "react";
import AddEditCustomerDrawer from "@/features/customers/AddEditCustomerDrawer";
import CustomerFilters from "@/features/customers/CustomerFilters";
import CustomerTable from "@/features/customers/CustomerTable";
import { Button } from "antd";
import { Icon } from "@iconify/react";

export default function CustomersPage() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState<boolean | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-semibold">Customers</h1>
        <Button onClick={() => setOpen(true)} size="large" type="primary">
          <Icon icon="mdi:plus" />
          Add Customer
        </Button>
      </div>
      <AddEditCustomerDrawer open={open} onClose={() => setOpen(false)} />
      
      {/* Filters */}
      <CustomerFilters
        searchTerm={searchTerm}
        membershipFilter={membershipFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onMembershipChange={setMembershipFilter}
        onStatusChange={setStatusFilter}
        onPageChange={setCurrentPage}
      />
      
      {/* Table */}
      <CustomerTable
        searchTerm={searchTerm}
        membershipFilter={membershipFilter}
        statusFilter={statusFilter}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
