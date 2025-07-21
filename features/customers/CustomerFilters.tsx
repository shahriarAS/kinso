"use client";
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
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "Select Status",
      options: [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      name: "search",
      label: "Search",
      type: "input",
      placeholder: "Search customers...",
      debounce: 500,
    },
    {
      name: "email",
      label: "Email",
      type: "input",
      placeholder: "Search by email...",
      debounce: 500,
    },
  ];

  const handleFiltersChange = (filters: Record<string, unknown>) => {
    // Convert "all" status to undefined
    const processedFilters = {
      ...filters,
      status:
        filters.status === "all"
          ? undefined
          : (filters.status as "active" | "inactive" | undefined),
    };
    onFiltersChange?.(processedFilters as CustomerFiltersType);
  };

  return (
    <GenericFilters
      fields={fields}
      onFiltersChange={handleFiltersChange}
      gridCols={4}
      debounceDelay={500}
    />
  );
}
