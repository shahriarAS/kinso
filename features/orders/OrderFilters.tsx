"use client";
import React, { useCallback } from "react";
import { PAYMENT_METHODS } from "@/lib/constraints";
import { GenericFilters, type FilterField } from "@/components/common";
import { useGetWarehousesQuery } from "@/features/warehouses";

interface OrderFilters {
  search?: string;
  paymentMethod?: string;
  warehouse?: string;
}

interface Props {
  searchTerm: string;
  paymentMethodFilter: string;
  onSearchChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onWarehouseChange: (value: string) => void;
  warehouseFilter: string;
}

export default function OrderFilters({
  searchTerm,
  paymentMethodFilter,
  onSearchChange,
  onPaymentMethodChange,
  onPageChange,
  onWarehouseChange,
  warehouseFilter,
}: Props) {
  const { data: warehousesData } = useGetWarehousesQuery({ limit: 100 });
  const warehouseOptions =
    warehousesData?.data.map((w) => ({ label: w.name, value: w._id })) || [];
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
    {
      name: "warehouse",
      label: "Warehouse",
      type: "select",
      placeholder: "Select Warehouse",
      options: [
        { label: "All", value: "" },
        ...warehouseOptions,
      ],
    },
  ];

  const handleFiltersChange = useCallback((filters: OrderFilters) => {
    console.log(filters)
    // Reset to first page when filters change
    const searchChanged = filters.search !== undefined && filters.search !== searchTerm;
    const paymentMethodChanged = filters.paymentMethod !== undefined && filters.paymentMethod !== paymentMethodFilter;
    const warehouseChanged = filters.warehouse !== undefined && filters.warehouse !== warehouseFilter;

    if (searchChanged || paymentMethodChanged || warehouseChanged) {
      onPageChange(1);
    }

    // Update individual filter values
    if (searchChanged) {
      onSearchChange(filters.search || "");
    }
    if (paymentMethodChanged) {
      onPaymentMethodChange(filters.paymentMethod || "");
    }
    if (warehouseChanged) {
      onWarehouseChange(filters.warehouse || "");
    }
  }, []);

  const initialValues = {
    search: searchTerm,
    paymentMethod: paymentMethodFilter,
    warehouse: warehouseFilter,
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
