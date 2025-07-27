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
import { useGetAllVendorsQuery } from "@/features/vendors";
import { useGetAllBrandsQuery } from "@/features/brands";
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

export default function AddEditProductDrawer({
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
  const { data: vendorsData } = useGetAllVendorsQuery();
  const { data: brandsData } = useGetAllBrandsQuery();

  const isEditing = !!product;
  const isLoading = isCreating || isUpdating;

  const categoryOptions =
    categoriesData?.data?.map((cat: { name: string; _id: string }) => ({
      label: cat.name,
      value: cat._id,
    })) || [];

  const vendorOptions =
    vendorsData?.data?.map((vendor: { name: string; _id: string }) => ({
      label: vendor.name,
      value: vendor._id,
    })) || [];

  const brandOptions =
    brandsData?.data?.map((brand: { name: string; _id: string }) => ({
      label: brand.name,
      value: brand._id,
    })) || [];

  // Define form fields using the generic interface
  const fields: CustomFormField[] = [
    {
      name: "productId",
      label: "Product ID",
      type: "input",
      placeholder: "Enter Product ID",
      rules: [
        { required: true, message: "Please enter product ID" },
        { min: 3, message: "Product ID must be at least 3 characters" },
      ],
    },
    {
      name: "name",
      label: "Product Name",
      type: "input",
      placeholder: "Enter Product Name",
      rules: [
        { required: true, message: "Please enter product name" },
        { min: 2, message: "Product name must be at least 2 characters" },
      ],
    },
    {
      name: "barcode",
      label: "Barcode",
      type: "input",
      placeholder: "Enter Barcode",
      rules: [
        { required: true, message: "Please enter barcode" },
        { min: 8, message: "Barcode must be at least 8 characters" },
        {
          pattern: /^[0-9]+$/,
          message: "Barcode must contain only numbers",
        },
      ],
    },
    {
      name: "vendorId",
      label: "Vendor",
      type: "select",
      placeholder: "Select Vendor",
      options: vendorOptions,
      rules: [{ required: true, message: "Please select a vendor" }],
    },
    {
      name: "brandId",
      label: "Brand",
      type: "select",
      placeholder: "Select Brand",
      options: brandOptions,
      rules: [{ required: true, message: "Please select a brand" }],
    },
    {
      name: "categoryId",
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
      render: (form: FormInstance) => <WarrantyInput form={form} />,
      rules: [],
    },
  ];

  const handleSubmit = async (values: ProductInput) => {
    try {
      if (isEditing && product) {
        await updateProduct({
          _id: product._id,
          product: values,
        }).unwrap();
        success("Product updated successfully");
      } else {
        await createProduct(values).unwrap();
        success("Product created successfully");
      }
      handleClose();
    } catch (error: any) {
      showError(error?.data?.message || "Failed to save product");
    }
  };

  const handleClose = () => {
    form.resetFields();
    setOpen(false);
    onClose?.();
  };

  const getInitialValues = (): Partial<ProductInput> | undefined => {
    if (!product) return undefined;

    return {
      productId: product.productId,
      name: product.name,
      barcode: product.barcode,
      vendorId: typeof product.vendorId === "string" ? product.vendorId : product.vendorId._id,
      brandId: typeof product.brandId === "string" ? product.brandId : product.brandId._id,
      categoryId: typeof product.categoryId === "string" ? product.categoryId : product.categoryId._id,
      warranty: product.warranty,
    };
  };

  return (
    <GenericDrawer
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Product" : "Add New Product"}
      form={form}
      fields={fields}
      initialValues={getInitialValues()}
      onSubmit={handleSubmit}
      submitText={isEditing ? "Update Product" : "Create Product"}
      loading={isLoading}
      width={600}
    />
  );
}
