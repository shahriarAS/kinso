"use client";
import { Icon } from "@iconify/react";
import { Button, Divider, Drawer, Form, Input, Select } from "antd";
import React, { useEffect } from "react";
import type { Product, ProductInput } from "@/features/products/types";

import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/features/products";
import { useGetAllCategoriesQuery } from "@/features/categories/api";
import { useGetWarehousesQuery } from "@/store/api/warehouses";
import StockEntries from "./StockEntries";
import toast from "react-hot-toast";

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

  // API hooks
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { data: categoriesData } = useGetAllCategoriesQuery();
  const { data: warehousesData } = useGetWarehousesQuery({});

  const isEditing = !!product;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (product && open) {
      // Transform stock data to match form structure
      const transformedStock =
        product.stock?.map((stockItem) => ({
          ...stockItem,
          warehouse:
            typeof stockItem.warehouse === "string"
              ? stockItem.warehouse
              : stockItem.warehouse?._id,
        })) || [];

      form.setFieldsValue({
        name: product.name,
        sku: product.sku,
        upc: product.upc,
        category:
          typeof product.category === "string"
            ? product.category
            : product.category?._id,
        stock: transformedStock,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [product, open, form]);

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && product) {
        await updateProduct({
          _id: product._id,
          product: values,
        }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct(values).unwrap();
        toast.success("Product created successfully");
      }

      handleClose();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        toast.error((error.data as { message: string }).message);
      } else if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation error
        return;
      } else {
        toast.error("Failed to save product");
      }
    }
  };

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

  return (
    <div>
      <Drawer
        title={isEditing ? "Edit Product" : "Add New Product"}
        open={open}
        onClose={handleClose}
        width={800}
        className="rounded-3xl"
        getContainer={false}
        destroyOnHidden={true}
        closeIcon={<Icon icon="lineicons:close" className="font-extrabold" />}
        extra={
          <div className="flex gap-4 justify-end">
            <Button type="default" onClick={handleClose} disabled={isLoading}>
              Discard
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={isLoading}>
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          name="product-add"
          layout="vertical"
          requiredMark={false}
          className="border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name" }]}
            className="font-medium"
          >
            <Input
              size="large"
              placeholder="Enter Product Name"
              className="w-full"
            />
          </Form.Item>

          <div className="grid grid-cols-3 gap-6">
            <Form.Item
              name="sku"
              label="SKU"
              rules={[{ required: true, message: "Please enter SKU" }]}
              className="font-medium"
            >
              <Input size="large" placeholder="Enter SKU" className="w-full" />
            </Form.Item>
            <Form.Item
              name="upc"
              label="UPC"
              rules={[{ required: true, message: "Please enter UPC" }]}
              className="font-medium"
            >
              <Input size="large" placeholder="Enter UPC" className="w-full" />
            </Form.Item>
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Please select a category" }]}
              className="font-medium"
            >
              <Select
                size="large"
                placeholder="Select Category"
                options={categoryOptions}
                className="w-full"
              />
            </Form.Item>
          </div>

          <Divider />

          {/* Stock List Section */}
          <StockEntries form={form} warehouseOptions={warehouseOptions} />
        </Form>
      </Drawer>
    </div>
  );
}
