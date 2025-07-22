"use client";
import React, { useCallback } from "react";
import { GenericFilters, type FilterField } from "@/components/common";

interface CategoryFilters {
  search?: string;
}

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function CategoryFilters({
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
      placeholder: "Search categories...",
      debounce: 500,
    },
  ];

  const handleFiltersChange = useCallback(
    (filters: CategoryFilters) => {
      // Reset to first page when filters change
      const searchChanged =
        filters.search !== undefined && filters.search !== searchTerm;
      if (searchChanged) {
        onPageChange(1);
      }

      // Update search value
      if (filters.search !== undefined) {
        onSearchChange(filters.search);
      }
    },
    [onPageChange, onSearchChange],
  );

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
