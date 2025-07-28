import React, { useMemo } from "react";
import { useCreateOutletMutation, useUpdateOutletMutation } from "./api";
import { Outlet, OutletInput } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { Form } from "antd";
import { GenericDrawer, FormField } from "@/components/common";
import { OUTLET_TYPES } from "@/types";

interface AddEditOutletDrawerProps {
  open: boolean;
  onClose: () => void;
  outlet?: Outlet | null;
}

const AddEditOutletDrawer: React.FC<AddEditOutletDrawerProps> = ({
  open,
  onClose,
  outlet,
}) => {
  const [form] = Form.useForm<OutletInput>();
  const { success, error } = useNotification();
  const [createOutlet, { isLoading: isCreating }] = useCreateOutletMutation();
  const [updateOutlet, { isLoading: isUpdating }] = useUpdateOutletMutation();

  const isEditing = !!outlet;

  // Define form fields for GenericDrawer
  const fields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Outlet Name",
        type: "input",
        placeholder: "Enter outlet name",
        rules: [
          { required: true, message: "Please enter outlet name" },
        ],
      },
      {
        name: "type",
        label: "Outlet Type",
        type: "select",
        placeholder: "Select outlet type",
        options: OUTLET_TYPES.map((type) => ({ label: type, value: type })),
      },
    ],
    []
  );

  // Set initial values for edit mode
  const initialValues = isEditing && outlet ? { name: outlet.name, type: outlet.type } : undefined;

  const handleSubmit = async (values: OutletInput) => {
    try {
      if (isEditing && outlet) {
        await updateOutlet({ _id: outlet._id, outlet: values }).unwrap();
        success("Outlet updated successfully");
      } else {
        await createOutlet(values).unwrap();
        success("Outlet created successfully");
      }
      onClose();
      form.resetFields();
    } catch (err) {
      error("Failed to save outlet");
    }
  };

  return (
    <GenericDrawer
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Outlet" : "Add Outlet"}
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

export default AddEditOutletDrawer; 