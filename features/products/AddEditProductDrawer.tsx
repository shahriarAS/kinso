"use client";
import { Form } from "antd";
import React from "react";
import { GenericDrawer, type FormField } from "@/components/common";
import type { Product, ProductInput } from "@/features/products/types";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/features/products";
import { useGetAllCategoriesQuery } from "@/features/categories/api";
import { useGetWarehousesQuery } from "@/features/warehouses";
import StockEntries from "./StockEntries";
import { useNotification } from "@/hooks/useNotification";
import WarrantyInput from "./WarrantyInput";
import type { FormInstance } from "antd";

// Extend FormField type to allow custom render
export type CustomFormField = FormField & {
  type?: string;
  render?: (form: FormInstance) => React.ReactNode;
};

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product?: Product | null;
  onClose?: () => void;
}

export default function AddEditProductDrawerRefactored({
  open,
  setOpen,
  product,
  onClose,
}: Props) {
  const [form] = Form.useForm<ProductInput>();
  const { success, error: showError } = useNotification();

  // API hooks
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: warehousesData } = useGetWarehousesQuery({});

  const isEditing = !!product;
  const isLoading = isCreating || isUpdating;

  const categoryOptions =
    categoriesData?.data?.map((cat: { name: string; _id: string }) => ({
      label: cat.name,
      value: cat._id,
    })) || [];

  const warehouseOptions =
    warehousesData?.data?.map((warehouse) => ({
      label: warehouse.name,
      value: warehouse._id,
    })) || [];

  // Define form fields using the generic interface
  const fields: CustomFormField[] = [
    {
      name: "name",
      label: "Product Name",
      type: "input",
      placeholder: "Enter Product Name",
      rules: [{ required: true, message: "Please enter product name" }],
    },
    {
      name: "sku",
      label: "SKU",
      type: "input",
      placeholder: "Enter SKU",
      rules: [{ required: true, message: "Please enter SKU" }],
    },
    {
      name: "upc",
      label: "UPC",
      type: "input",
      placeholder: "Enter UPC",
      rules: [{ required: true, message: "Please enter UPC" }],
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      placeholder: "Select Category",
      options: categoryOptions,
      rules: [{ required: true, message: "Please select a category" }],
    },
    {
      name: "warranty",
      label: "Warranty",
      type: "custom",
      render: (form: FormInstance) => <WarrantyInput form={form} />, // Use the custom component
      rules: [], // No required rule, so it's optional
    },
  ];

  const handleSubmit = async (values: ProductInput) => {
    try {
      // If warranty is empty or has no value, remove it from payload
      const submitValues = { ...values };
      if (
        !submitValues.warranty ||
        submitValues.warranty.value === undefined ||
        submitValues.warranty.value === null
      ) {
        delete submitValues.warranty;
      }
      if (isEditing && product) {
        await updateProduct({
          _id: product._id,
          product: submitValues,
        }).unwrap();
        success("Product updated successfully");
      } else {
        await createProduct(submitValues).unwrap();
        success("Product created successfully");
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        showError(
          "Failed to save product",
          (error.data as { message: string }).message,
        );
      } else if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation error
        return;
      } else {
        showError("Failed to save product");
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Transform product data for form initialization
  const getInitialValues = (): Partial<ProductInput> | undefined => {
    if (!product || !open) return undefined;

    const transformedStock =
      product.stock?.map((stockItem) => ({
        ...stockItem,
        warehouse:
          typeof stockItem.warehouse === "string"
            ? stockItem.warehouse
            : stockItem.warehouse?._id,
      })) || [];

    let initialWarranty: { value: number; unit: string } | undefined =
      undefined;
    if (
      product.warranty &&
      typeof product.warranty === "object" &&
      product.warranty.value !== undefined &&
      product.warranty.value !== null
    ) {
      initialWarranty = {
        value: product.warranty.value,
        unit: product.warranty.unit,
      };
    }

    return {
      name: product.name,
      sku: product.sku,
      upc: product.upc,
      category:
        typeof product.category === "string"
          ? product.category
          : product.category?._id,
      warranty: initialWarranty,
      stock: transformedStock,
    };
  };

  return (
    <GenericDrawer
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Product" : "Add New Product"}
      width={800}
      form={form}
      fields={fields}
      initialValues={getInitialValues()}
      onSubmit={handleSubmit}
      submitText={isEditing ? "Update" : "Save"}
      loading={isLoading}
      gridCols={3}
    >
      {/* Custom Stock Entries Section */}
      <div className="mt-6">
        <StockEntries form={form} warehouseOptions={warehouseOptions} />
      </div>
    </GenericDrawer>
  );
}
