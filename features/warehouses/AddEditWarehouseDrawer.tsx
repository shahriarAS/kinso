import React, { useMemo } from "react";
import { useCreateWarehouseMutation, useUpdateWarehouseMutation } from "./api";
import { Warehouse, WarehouseInput } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { Form } from "antd";
import { GenericDrawer, FormField } from "@/components/common";
import { OUTLET_TYPES } from "@/types";

interface AddEditWarehouseDrawerProps {
  open: boolean;
  onClose: () => void;
  warehouse?: Warehouse | null;
}

const AddEditWarehouseDrawer: React.FC<AddEditWarehouseDrawerProps> = ({
  open,
  onClose,
  warehouse,
}) => {
  const [form] = Form.useForm<WarehouseInput>();
  const { success, error } = useNotification();
  const [createWarehouse, { isLoading: isCreating }] =
    useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: isUpdating }] =
    useUpdateWarehouseMutation();

  const isEditing = !!warehouse;

  // Define form fields for GenericDrawer
  const fields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Warehouse Name",
        type: "input",
        placeholder: "Enter warehouse name",
        rules: [{ required: true, message: "Please enter warehouse name" }],
      }
    ],
    [],
  );

  // Set initial values for edit mode
  const initialValues =
    isEditing && warehouse
      ? { name: warehouse.name}
      : undefined;

  const handleSubmit = async (values: WarehouseInput) => {
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
      onClose();
      form.resetFields();
    } catch (err) {
      error("Failed to save warehouse");
    }
  };

  return (
    <GenericDrawer
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Warehouse" : "Add Warehouse"}
      form={form}
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitText={isEditing ? "Update" : "Create"}
      loading={isCreating || isUpdating}
      width={500}
    />
  );
};

export default AddEditWarehouseDrawer;
