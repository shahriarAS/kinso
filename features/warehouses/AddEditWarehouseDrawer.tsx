"use client";
import { Form } from "antd";
import React from "react";
import { Warehouse } from "@/features/warehouses/types";
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from "@/features/warehouses/api";
import { useNotification } from "@/hooks/useNotification";
import { GenericDrawer, type FormField } from "@/components/common";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  warehouse?: Warehouse | null;
  onClose?: () => void;
}

export default function AddEditWarehouseDrawer({
  open,
  setOpen,
  warehouse,
  onClose,
}: Props) {
  const [form] = Form.useForm<Warehouse>();
  const { success, error: showError } = useNotification();

  // API hooks
  const [createWarehouse, { isLoading: isCreating }] =
    useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: isUpdating }] =
    useUpdateWarehouseMutation();

  const isEditing = !!warehouse;
  const isLoading = isCreating || isUpdating;

  // Define form fields using the generic interface
  const fields: FormField[] = [
    {
      name: "warehouseId",
      label: "Warehouse ID",
      type: "input",
      placeholder: "e.g., WH001",
      rules: [
        { required: true, message: "Please enter warehouse ID" },
        { min: 2, message: "Warehouse ID must be at least 2 characters" },
        { max: 20, message: "Warehouse ID must not exceed 20 characters" },
        {
          pattern: /^[A-Z0-9]+$/,
          message: "Warehouse ID must contain only uppercase letters and numbers",
        },
      ],
    },
    {
      name: "name",
      label: "Warehouse Name",
      type: "input",
      placeholder: "Enter Warehouse Name",
      rules: [{ required: true, message: "Please enter warehouse name" }],
    },
    {
      name: "location",
      label: "Location",
      type: "input",
      placeholder: "Enter Location",
      rules: [{ required: true, message: "Please enter location" }],
    },
  ];

  const handleSubmit = async (values: Warehouse) => {
    try {
      if (isEditing && warehouse) {
        await updateWarehouse({
          _id: warehouse._id,
          warehouse: values,
        }).unwrap();
        success("Warehouse updated successfully");
      } else {
        await createWarehouse(values).unwrap();
        success("Warehouse created successfully");
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
          "Failed to save warehouse",
          (error.data as { message: string }).message,
        );
      } else {
        showError("Failed to save warehouse");
      }
      throw error; // Re-throw to prevent drawer from closing
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <GenericDrawer
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit Warehouse" : "Add New Warehouse"}
      form={form}
      fields={fields}
      initialValues={
        warehouse
          ? {
              warehouseId: warehouse.warehouseId,
              name: warehouse.name,
              location: warehouse.location,
            }
          : undefined
      }
      onSubmit={handleSubmit}
      loading={isLoading}
      submitText={isEditing ? "Update" : "Save"}
    />
  );
}
