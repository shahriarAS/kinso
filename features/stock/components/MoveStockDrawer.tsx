"use client";
import { Form } from "antd";
import { useEffect, useState, useMemo } from "react";
import { GenericDrawer, type FormField } from "@/components/common";
import { useTransferStockMutation } from "@/features/stock/api";
import { useGetProductsQuery } from "@/features/products/api";
import { useGetWarehousesQuery } from "@/features/warehouses";
import { outletsApi } from "@/features/outlets";
import { useNotification } from "@/hooks/useNotification";
import type { Stock } from "@/features/stock/types";

interface MoveStockDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedStock?: Stock | null;
}

interface TransferFormData {
  product: string;
  fromLocation: string;
  toLocation: string;
  fromLocationType: "Warehouse" | "Outlet";
  toLocationType: "Warehouse" | "Outlet";
  unit: number;
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
  const [fromLocationOptions, setFromLocationOptions] = useState<any[]>([]);
  const [toLocationOptions, setToLocationOptions] = useState<any[]>([]);

  // Watch form values for location types
  const fromLocationType = Form.useWatch("fromLocationType", form);
  const toLocationType = Form.useWatch("toLocationType", form);

  // API hooks
  const [transferStock, { isLoading }] = useTransferStockMutation();
  const { data: productsData } = useGetProductsQuery({ limit: 1000 });
  const { data: warehousesData } = useGetWarehousesQuery({ limit: 1000 });
  const { data: outletsData } = outletsApi.useGetOutletsQuery({ limit: 1000 });

  const productOptions = useMemo(
    () =>
      productsData?.data?.map((product: any) => ({
        label: `${product.name} (${product.barcode})`,
        value: product._id,
      })) || [],
    [productsData],
  );

  const warehouseOptions = useMemo(
    () =>
      warehousesData?.data?.map((warehouse: any) => ({
        label: warehouse.name,
        value: warehouse._id,
      })) || [],
    [warehousesData],
  );

  const outletOptions = useMemo(
    () =>
      outletsData?.data?.map((outlet: any) => ({
        label: `${outlet.name} (${outlet.type})`,
        value: outlet._id,
      })) || [],
    [outletsData],
  );

  const locationTypeOptions = [
    { label: "Warehouse", value: "Warehouse" },
    { label: "Outlet", value: "Outlet" },
  ];

  // Define form fields
  const fields: FormField[] = [
    {
      name: "product",
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
      rules: [
        { required: true, message: "Please select source location type" },
      ],
    },
    {
      name: "fromLocation",
      label: "From Location",
      type: "select",
      placeholder: "Select Source Location",
      options: fromLocationOptions,
      rules: [{ required: true, message: "Please select source location" }],
    },
    {
      name: "toLocationType",
      label: "To Location Type",
      type: "select",
      placeholder: "Select Location Type",
      options: locationTypeOptions,
      rules: [
        { required: true, message: "Please select destination location type" },
      ],
    },
    {
      name: "toLocation",
      label: "To Location",
      type: "select",
      placeholder: "Select Destination Location",
      options: toLocationOptions,
      rules: [
        { required: true, message: "Please select destination location" },
      ],
    },
    {
      name: "unit",
      label: "Quantity",
      type: "number",
      placeholder: "Enter quantity to transfer",
      rules: [
        { required: true, message: "Please enter quantity" },
        {
          validator: (_: any, value: any) => {
            if (!value || value < 1) {
              return Promise.reject(new Error("Quantity must be at least 1"));
            }
            if (value > maxQuantity) {
              return Promise.reject(
                new Error(`Maximum available quantity is ${maxQuantity}`),
              );
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
    if (fromLocationType === "Warehouse") {
      setFromLocationOptions(warehouseOptions);
      // Only clear the field if we're not setting initial values from selectedStock
      if (!selectedStock || !open) {
        form.setFieldsValue({ fromLocation: undefined });
      }
    } else if (fromLocationType === "Outlet") {
      setFromLocationOptions(outletOptions);
      // Only clear the field if we're not setting initial values from selectedStock
      if (!selectedStock || !open) {
        form.setFieldsValue({ fromLocation: undefined });
      }
    } else {
      setFromLocationOptions([]);
    }
  }, [fromLocationType, warehouseOptions, outletOptions, selectedStock, open]);

  useEffect(() => {
    if (toLocationType === "Warehouse") {
      setToLocationOptions(warehouseOptions);
      form.setFieldsValue({ toLocation: undefined });
    } else if (toLocationType === "Outlet") {
      setToLocationOptions(outletOptions);
      form.setFieldsValue({ toLocation: undefined });
    } else {
      setToLocationOptions([]);
    }
  }, [toLocationType, warehouseOptions, outletOptions]);

  // Calculate max quantity when product and source location are selected
  useEffect(() => {
    const product = form.getFieldValue("product");
    const fromLocation = form.getFieldValue("fromLocation");
    const fromLocationType = form.getFieldValue("fromLocationType");

    if (product && fromLocation && fromLocationType) {
      // In a real implementation, you would fetch the available stock
      // For now, we'll set a default value
      setMaxQuantity(selectedStock?.unit || 100);
    }
  }, [selectedStock]);

  const handleSubmit = async (values: TransferFormData) => {
    try {
      // Map form values to API parameters
      const transferData = {
        product: values.product,
        fromLocation: values.fromLocation,
        toLocation: values.toLocation,
        fromLocationType: values.fromLocationType,
        toLocationType: values.toLocationType,
        unit: values.unit,
        reason: values.reason,
      };

      await transferStock(transferData).unwrap();
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
      const fromLocType = selectedStock.locationType as "Warehouse" | "Outlet";
      const locationId =
        typeof selectedStock.location === "string"
          ? selectedStock.location
          : selectedStock.location._id;

      form.setFieldsValue({
        product:
          typeof selectedStock.product === "string"
            ? selectedStock.product
            : selectedStock.product._id,
        fromLocationType: fromLocType,
        fromLocation: locationId,
        unit: selectedStock.unit,
      });
      setMaxQuantity(selectedStock.unit);
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
