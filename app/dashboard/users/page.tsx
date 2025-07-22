"use client";

import { useState, useCallback } from "react";
import { Button } from "antd";
import { Icon } from "@iconify/react";
import { AddEditUserDrawer, UserFilters, UserTable } from "@/features/users";
import type { UserFilters as UserFiltersType } from "@/features/users/types";

export default function Users() {
  const [filters, setFilters] = useState<UserFiltersType>({
    search: "",
    role: undefined,
  });
  const [open, setOpen] = useState(false);

  const handleFiltersChange = useCallback((newFilters: UserFiltersType) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold">Users</h1>
        <Button
          onClick={() => setOpen(true)}
          size="large"
          type="primary"
          icon={<Icon icon="mdi:plus" />}
        >
          Add User
        </Button>
      </div>
      <AddEditUserDrawer open={open} setOpen={setOpen} />
      {/* Filters */}
      <UserFilters onFiltersChange={handleFiltersChange} />
      {/* Table */}
      <UserTable filters={filters} />
    </div>
  );
}
