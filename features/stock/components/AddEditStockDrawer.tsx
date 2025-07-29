"use client";
import React, { useState, useEffect } from "react";
import { Form, Select } from "antd";
import dayjs from "dayjs";
import { GenericDrawer, type FormField } from "@/components/common";
import { useAddStockMutation, useUpdateStockMutation } from "../api";
import { useGetProductsQuery } from "@/features/products/api";
import { useGetOutletsQuery } from "@/features/outlets/api";
import { useGetWarehousesQuery } from "@/features/warehouses/api";
import { Stock, StockInput } from "../types";
import { useNotification } from "@/hooks/useNotification";

interface AddEditStockDrawerProps {
  open: boolean;
  onClose: () => void;
  stock?: Stock | null; // Stock to edit, null for adding new stock
}

const AddEditStockDrawer: React.FC<AddEditStockDrawerProps> = ({
  open,
  onClose,
  stock,
}) => {
  const [form] = Form.useForm<StockInput>();
  const { success } = useNotification();
  const [locationType, setLocationType] = useState<"warehouse" | "outlet">(
    "warehouse",
  );
  const [addStock, { isLoading: isAddingStock }] = useAddStockMutation();
  const [updateStock, { isLoading: isUpdatingStock }] =
    useUpdateStockMutation();

  const isEditing = !!stock;
  const isLoading = isAddingStock || isUpdatingStock;

  // Set location type and form values when stock prop changes
  useEffect(() => {
    if (stock && open) {
      const stockLocationType =
        stock.locationType.toLowerCase() === "warehouse"
          ? "warehouse"
          : "outlet";
      setLocationType(stockLocationType);

      const product =
        typeof stock.product === "string" ? stock.product : stock.product._id;
      const locationId =
        typeof stock.location === "string"
          ? stock.location
          : stock.location._id;

      form.setFieldsValue({
        product: product,
        locationType: stockLocationType,
        location: locationId,
        mrp: stock.mrp,
        tp: stock.tp,
        unit: stock.unit,
        batchNumber: stock.batchNumber,
        expireDate: stock.expireDate
          ? dayjs(stock.expireDate).format("YYYY-MM-DD")
          : "",
      });
    } else if (!stock && open) {
      // Reset form for new stock
      setLocationType("warehouse");
      form.resetFields();
    }
  }, [stock, open, form]);

  const { data: productsData } = useGetProductsQuery({ limit: 1000 });
  const { data: outletsData } = useGetOutletsQuery({ limit: 1000 });
  const { data: warehousesData } = useGetWarehousesQuery({ limit: 1000 });

  const productOptions =
    productsData?.data?.map((product) => ({
      label: `${product.name} (${product.barcode})`,
      value: product._id,
    })) || [];

  const locationOptions =
    locationType === "outlet"
      ? outletsData?.data?.map((outlet) => ({
          label: `${outlet.name} (${outlet.type})`,
          value: outlet._id,
        })) || []
      : warehousesData?.data?.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse._id,
        })) || [];

  // Define form fields for GenericDrawer
  const fields: FormField[] = [
    {
      name: "product",
      label: "Product",
      type: "select",
      placeholder: "Select a product",
      options: productOptions,
      rules: [{ required: true, message: "Please select a product" }],
    },
    {
      name: "locationType",
      label: "Location Type",
      type: "custom",
      rules: [{ required: true, message: "Please select location type" }],
      render: () => (
        <Select
          placeholder="Select location type"
          onChange={(value: "warehouse" | "outlet") => {
            setLocationType(value);
            form.setFieldsValue({ location: undefined });
          }}
          size="large"
          className="w-full"
        >
          <Select.Option value="warehouse">Warehouse</Select.Option>
          <Select.Option value="outlet">Outlet</Select.Option>
        </Select>
      ),
    },
    {
      name: "location",
      label: locationType === "warehouse" ? "Warehouse" : "Outlet",
      type: "select",
      placeholder: `Select a ${locationType}`,
      options: locationOptions,
      rules: [{ required: true, message: `Please select a ${locationType}` }],
    },
    {
      name: "mrp",
      label: "MRP (Maximum Retail Price)",
      type: "number",
      placeholder: "Enter MRP",
      rules: [
        { required: true, message: "Please enter MRP" },
        {
          pattern: /^[0-9]+(\.[0-9]+)?$/,
          message: "Please enter a valid price",
        },
      ],
    },
    {
      name: "tp",
      label: "TP (Trade Price)",
      type: "number",
      placeholder: "Enter TP",
      rules: [
        { required: true, message: "Please enter TP" },
        {
          pattern: /^[0-9]+(\.[0-9]+)?$/,
          message: "Please enter a valid price",
        },
      ],
    },
    {
      name: "unit",
      label: "Units",
      type: "number",
      placeholder: "Enter number of units",
      rules: [
        { required: true, message: "Please enter units" },
        {
          pattern: /^[1-9][0-9]*$/,
          message: "Units must be a positive number",
        },
      ],
    },
    {
      name: "batchNumber",
      label: "Batch Number",
      type: "input",
      placeholder: "Enter batch number",
      rules: [{ required: true, message: "Please enter batch number" }],
    },
    {
      name: "expireDate",
      label: "Expire Date",
      type: "date",
      placeholder: "Select expire date",
      rules: [{ required: true, message: "Please select expire date" }],
    },
  ];

  const handleSubmit = async (values: any) => {
    try {
      const stockData: StockInput = {
        product: values.product,
        location: values.location,
        locationType:
          values.locationType === "warehouse" ? "Warehouse" : "Outlet",
        mrp: parseFloat(values.mrp),
        tp: parseFloat(values.tp),
        expireDate: values.expireDate,
        unit: parseInt(values.unit),
        batchNumber: values.batchNumber,
      };

      if (isEditing && stock) {
        await updateStock({ _id: stock._id, stock: stockData }).unwrap();
        success("Stock updated successfully");
      } else {
        await addStock(stockData).unwrap();
        success("Stock added successfully");
      }
    } catch (error) {
      console.error("Stock operation failed:", error);
    }
  };

  return (
    <GenericDrawer<StockInput>
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Stock" : "Add Stock"}
      form={form}
      fields={fields}
      onSubmit={handleSubmit}
      submitText={isEditing ? "Update Stock" : "Add Stock"}
      loading={isLoading}
      width={600}
    />
  );
};

export default AddEditStockDrawer;
