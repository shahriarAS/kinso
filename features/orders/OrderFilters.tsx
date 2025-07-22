"use client";
import React, { useCallback } from "react";
import { PAYMENT_METHODS } from "@/lib/constraints";
import { GenericFilters, type FilterField } from "@/components/common";
import { useGetWarehousesQuery } from "@/features/warehouses";
import { Product } from "@/features/products";
import ProductSelect from "@/features/products/ProductSelect";

interface OrderFilters {
  search?: string;
  paymentMethod?: string;
  warehouse?: string;
  product?: string;
}

interface Props {
  searchTerm: string;
  paymentMethodFilter: string;
  onSearchChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onWarehouseChange: (value: string) => void;
  warehouseFilter: string;
  productFilter: string;
  onProductChange: (value: string) => void;
}

export default function OrderFilters({
  searchTerm,
  paymentMethodFilter,
  onSearchChange,
  onPaymentMethodChange,
  onPageChange,
  onWarehouseChange,
  warehouseFilter,
  productFilter,
  onProductChange,
}: Props) {
  const { data: warehousesData } = useGetWarehousesQuery({ limit: 100 });
  const { useGetProductsQuery } = require("@/features/products");
  const { data: productsData } = useGetProductsQuery({ limit: 100 });
  const productOptions =
    productsData?.data.map((p: Product) => ({ label: p.name, value: p._id })) ||
    [];
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
      options: [{ label: "All", value: "" }, ...warehouseOptions],
    },
    {
      name: "product",
      label: "Product",
      type: "custom",
      component: (
        <ProductSelect
          value={productFilter}
          onChange={onProductChange}
          placeholder="Select Product"
        />
      ),
    },
  ];

  const handleFiltersChange = useCallback((filters: OrderFilters) => {
    console.log(filters);
    // Reset to first page when filters change
    const searchChanged =
      filters.search !== undefined && filters.search !== searchTerm;
    const paymentMethodChanged =
      filters.paymentMethod !== undefined &&
      filters.paymentMethod !== paymentMethodFilter;
    const warehouseChanged =
      filters.warehouse !== undefined && filters.warehouse !== warehouseFilter;
    const productChanged =
      filters.product !== undefined && filters.product !== productFilter;

    if (
      searchChanged ||
      paymentMethodChanged ||
      warehouseChanged ||
      productChanged
    ) {
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
    if (productChanged) {
      onProductChange(filters.product || "");
    }
  }, []);

  const initialValues = {
    search: searchTerm,
    paymentMethod: paymentMethodFilter,
    warehouse: warehouseFilter,
    product: productFilter,
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
