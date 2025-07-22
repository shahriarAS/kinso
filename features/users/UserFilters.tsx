"use client";
import React, { useCallback } from "react";
import { GenericFilters, type FilterField } from "@/components/common";
import type { UserFilters as UserFiltersType } from "./types";

interface UserFiltersProps {
  onFiltersChange?: (filters: UserFiltersType) => void;
}

export default function UserFilters({ onFiltersChange }: UserFiltersProps) {
  // Define filter fields using the generic interface
  const fields: FilterField[] = [
    {
      name: "search",
      label: "Search",
      type: "input",
      placeholder: "Search users...",
      debounce: 500,
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "Select Role",
      options: [
        { label: "All Roles", value: "" },
        { label: "Admin", value: "admin" },
        { label: "Manager", value: "manager" },
        { label: "Staff", value: "staff" },
      ],
    },
  ];

  const handleFiltersChange = useCallback(
    (filters: Record<string, unknown>) => {
      // Convert empty role to undefined
      const processedFilters = {
        ...filters,
        role: filters.role === "" ? undefined : filters.role,
      };
      onFiltersChange?.(processedFilters as UserFiltersType);
    },
    [onFiltersChange],
  );

  return (
    <GenericFilters
      fields={fields}
      onFiltersChange={handleFiltersChange}
      gridCols={4}
      debounceDelay={500}
    />
  );
}
