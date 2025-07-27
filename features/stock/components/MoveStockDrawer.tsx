"use client";
import { Form, Select, InputNumber, Button, message } from "antd";
import React, { useEffect, useState } from "react";
import { GenericDrawer, type FormField } from "@/components/common";
import { useTransferStockMutation } from "@/features/stock/api";
import { useGetProductsQuery } from "@/features/products/api";
import { useGetWarehousesQuery } from "@/features/warehouses";
import { outletsApi } from "@/features/outlets";
import { useNotification } from "@/hooks/useNotification";
import type { Stock } from "@/features/stock/types";
import type { FormInstance } from "antd";

interface MoveStockDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedStock?: Stock | null;
}

interface TransferFormData {
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  fromLocationType: "Warehouse" | "Outlet";
  toLocationType: "Warehouse" | "Outlet";
  quantity: number;
  reason: string;
}

export default function MoveStockDrawer({
  open,
  onClose,
  selectedStock,
}: MoveStockDrawerProps) {
  const [form] = Form.useForm<TransferFormData>();
  const { success, error: showError } = useNotification();
  const [maxQuantity, setMaxQuantity] = useState(0);

  // API hooks
  const [transferStock, { isLoading }] = useTransferStockMutation();
  const { data: productsData } = useGetProductsQuery({ limit: 1000 });
  const { data: warehousesData } = useGetWarehousesQuery({ limit: 1000 });
  const { data: outletsData } = outletsApi.useGetOutletsQuery({ limit: 1000 });

  const productOptions =
    productsData?.data?.map((product: any) => ({
      label: `${product.name} (${product.barcode})`,
      value: product._id,
    })) || [];

  const warehouseOptions =
    warehousesData?.data?.map((warehouse: any) => ({
      label: warehouse.name,
      value: warehouse._id,
    })) || [];

  const outletOptions =
    outletsData?.data?.map((outlet: any) => ({
      label: `${outlet.name} (${outlet.type})`,
      value: outlet._id,
    })) || [];

  const locationTypeOptions = [
    { label: "Warehouse", value: "Warehouse" },
    { label: "Outlet", value: "Outlet" },
  ];

  // Define form fields
  const fields: FormField[] = [
    {
      name: "productId",
      label: "Product",
      type: "select",
      placeholder: "Select Product",
      options: productOptions,
      rules: [{ required: true, message: "Please select a product" }],
    },
    {
      name: "fromLocationType",
      label: "From Location Type",
      type: "select",
      placeholder: "Select Location Type",
      options: locationTypeOptions,
      rules: [{ required: true, message: "Please select source location type" }],
    },
    {
      name: "fromLocationId",
      label: "From Location",
      type: "select",
      placeholder: "Select Source Location",
      options: [],
      rules: [{ required: true, message: "Please select source location" }],
    },
    {
      name: "toLocationType",
      label: "To Location Type",
      type: "select",
      placeholder: "Select Location Type",
      options: locationTypeOptions,
      rules: [{ required: true, message: "Please select destination location type" }],
    },
    {
      name: "toLocationId",
      label: "To Location",
      type: "select",
      placeholder: "Select Destination Location",
      options: [],
      rules: [{ required: true, message: "Please select destination location" }],
    },
    {
      name: "quantity",
      label: "Quantity",
      type: "number",
      placeholder: "Enter quantity to transfer",
      rules: [
        { required: true, message: "Please enter quantity" },
        { type: "number", min: 1, message: "Quantity must be at least 1" },
        {
          validator: (_: any, value: any) => {
            if (value > maxQuantity) {
              return Promise.reject(new Error(`Maximum available quantity is ${maxQuantity}`));
            }
            return Promise.resolve();
          },
        },
      ],
    },
    {
      name: "reason",
      label: "Reason",
      type: "input",
      placeholder: "Enter transfer reason (optional)",
      rules: [],
    },
  ];

  // Update location options based on selected type
  useEffect(() => {
    const fromLocationType = form.getFieldValue("fromLocationType");
    const toLocationType = form.getFieldValue("toLocationType");

    if (fromLocationType === "Warehouse") {
      form.setFieldsValue({ fromLocationId: undefined });
      // Update from location options to show warehouses
      const fromLocationField = fields.find(f => f.name === "fromLocationId");
      if (fromLocationField) {
        fromLocationField.options = warehouseOptions;
      }
    } else if (fromLocationType === "Outlet") {
      form.setFieldsValue({ fromLocationId: undefined });
      // Update from location options to show outlets
      const fromLocationField = fields.find(f => f.name === "fromLocationId");
      if (fromLocationField) {
        fromLocationField.options = outletOptions;
      }
    }

    if (toLocationType === "Warehouse") {
      form.setFieldsValue({ toLocationId: undefined });
      // Update to location options to show warehouses
      const toLocationField = fields.find(f => f.name === "toLocationId");
      if (toLocationField) {
        toLocationField.options = warehouseOptions;
      }
    } else if (toLocationType === "Outlet") {
      form.setFieldsValue({ toLocationId: undefined });
      // Update to location options to show outlets
      const toLocationField = fields.find(f => f.name === "toLocationId");
      if (toLocationField) {
        toLocationField.options = outletOptions;
      }
    }
  }, [form, warehouseOptions, outletOptions]);

  // Calculate max quantity when product and source location are selected
  useEffect(() => {
    const productId = form.getFieldValue("productId");
    const fromLocationId = form.getFieldValue("fromLocationId");
    const fromLocationType = form.getFieldValue("fromLocationType");

    if (productId && fromLocationId && fromLocationType) {
      // In a real implementation, you would fetch the available stock
      // For now, we'll set a default value
      setMaxQuantity(selectedStock?.quantity || 100);
    }
  }, [form, selectedStock]);

  const handleSubmit = async (values: TransferFormData) => {
    try {
      await transferStock(values).unwrap();
      success("Stock transferred successfully");
      handleClose();
    } catch (error: any) {
      showError(error?.data?.message || "Failed to transfer stock");
    }
  };

  const handleClose = () => {
    form.resetFields();
    setMaxQuantity(0);
    onClose();
  };

  // Set initial values if stock is selected
  useEffect(() => {
    if (open && selectedStock) {
      form.setFieldsValue({
        productId: selectedStock.productId,
        fromLocationId: selectedStock.locationId,
        fromLocationType: selectedStock.locationType as "Warehouse" | "Outlet",
        quantity: selectedStock.quantity,
      });
      setMaxQuantity(selectedStock.quantity);
    }
  }, [open, selectedStock, form]);

  return (
    <GenericDrawer
      open={open}
      onClose={handleClose}
      title="Transfer Stock"
      form={form}
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Transfer Stock"
      loading={isLoading}
      width={600}
    />
  );
} 