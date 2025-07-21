"use client";
import React from "react";
import { PAYMENT_METHODS } from "@/lib/constraints";
import { GenericFilters, type FilterField } from "@/components/common";

interface OrderFilters {
  search?: string;
  paymentMethod?: string;
}

interface Props {
  searchTerm: string;
  paymentMethodFilter: string;
  onSearchChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function OrderFilters({
  searchTerm,
  paymentMethodFilter,
  onSearchChange,
  onPaymentMethodChange,
  onPageChange,
}: Props) {
  // Define filter fields using the generic interface
  const fields: FilterField[] = [
    {
      name: "search",
      label: "Search",
      type: "input",
      placeholder: "Search orders...",
      debounce: 500,
    },
    {
      name: "paymentMethod",
      label: "Payment Method",
      type: "select",
      placeholder: "Select Payment Method",
      options: [
        { label: "All", value: "" },
        ...PAYMENT_METHODS.map((method) => ({
          label: method.label,
          value: method.value,
        })),
      ],
    },
  ];

  const handleFiltersChange = (filters: OrderFilters) => {
    // Reset to first page when filters change
    onPageChange(1);

    // Update individual filter values
    if (filters.search !== undefined) {
      onSearchChange(filters.search);
    }
    if (filters.paymentMethod !== undefined) {
      onPaymentMethodChange(filters.paymentMethod);
    }
  };

  const initialValues = {
    search: searchTerm,
    paymentMethod: paymentMethodFilter,
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
