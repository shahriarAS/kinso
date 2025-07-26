"use client";
import { useCallback } from "react";
import { CustomerFilters as CustomerFiltersType } from "./types";
import { GenericFilters, type FilterField } from "@/components/common";

interface CustomerFiltersProps {
  onFiltersChange?: (filters: CustomerFiltersType) => void;
}

export default function CustomerFilters({
  onFiltersChange,
}: CustomerFiltersProps) {
  // Define filter fields using the generic interface
  const fields: FilterField[] = [
    {
      name: "membershipStatus",
      label: "Membership Status",
      type: "select",
      placeholder: "Select Membership Status",
      options: [
        { label: "All", value: "all" },
        { label: "Members", value: "true" },
        { label: "Non-Members", value: "false" },
      ],
    },
    {
      name: "search",
      label: "Search",
      type: "input",
      placeholder: "Search by ID, name, or contact...",
      debounce: 500,
    },
    {
      name: "customerName",
      label: "Customer Name",
      type: "input",
      placeholder: "Search by customer name...",
      debounce: 500,
    },
  ];

  const handleFiltersChange = useCallback(
    (filters: Record<string, unknown>) => {
      // Convert "all" membership status to undefined
      const processedFilters = {
        ...filters,
        membershipStatus:
          filters.membershipStatus === "all"
            ? undefined
            : filters.membershipStatus === "true"
            ? true
            : filters.membershipStatus === "false"
            ? false
            : undefined,
      };
      onFiltersChange?.(processedFilters as CustomerFiltersType);
    },
    [onFiltersChange],
  );

  return (
    <GenericFilters
      fields={fields}
      onFiltersChange={handleFiltersChange}
      gridCols={3}
      debounceDelay={500}
    />
  );
}
