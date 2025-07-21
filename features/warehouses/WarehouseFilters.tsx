"use client";
import React from "react";
import { GenericFilters, type FilterField } from "@/components/common";

interface WarehouseFilters {
  search?: string;
  location?: string;
}

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function WarehouseFilters({
  searchTerm,
  onSearchChange,
  onPageChange,
}: Props) {
  // Define filter fields using the generic interface
  const fields: FilterField[] = [
    {
      name: "search",
      label: "Search",
      type: "input",
      placeholder: "Search warehouses...",
      debounce: 500,
    },
    {
      name: "location",
      label: "Location",
      type: "input",
      placeholder: "Location",
      debounce: 500,
    },
  ];

  const handleFiltersChange = (filters: WarehouseFilters) => {
    // Reset to first page when filters change
    onPageChange(1);

    // Update search value
    if (filters.search !== undefined) {
      onSearchChange(filters.search);
    }
  };

  const initialValues = {
    search: searchTerm,
  };

  return (
    <GenericFilters
      fields={fields}
      initialValues={initialValues}
      onFiltersChange={handleFiltersChange}
      gridCols={4}
      debounceDelay={500}
    />
  );
}
