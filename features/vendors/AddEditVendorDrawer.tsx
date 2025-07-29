import React, { useMemo } from "react";
import { useCreateVendorMutation, useUpdateVendorMutation } from "./api";
import { Vendor, VendorInput } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { Form } from "antd";
import { GenericDrawer, FormField } from "@/components/common";

interface AddEditVendorDrawerProps {
  open: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
}

const AddEditVendorDrawer: React.FC<AddEditVendorDrawerProps> = ({
  open,
  onClose,
  vendor,
}) => {
  const [form] = Form.useForm<VendorInput>();
  const { success, error } = useNotification();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const isEditing = !!vendor;

  // Define form fields for GenericDrawer
  const fields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Vendor Name",
        type: "input",
        placeholder: "Enter vendor name",
        rules: [{ required: true, message: "Please enter vendor name" }],
      },
    ],
    [],
  );

  // Set initial values for edit mode
  const initialValues = isEditing && vendor ? { name: vendor.name } : undefined;

  const handleSubmit = async (values: VendorInput) => {
    try {
      if (isEditing && vendor) {
        await updateVendor({ _id: vendor._id, vendor: values }).unwrap();
        success("Vendor updated successfully");
      } else {
        await createVendor(values).unwrap();
        success("Vendor created successfully");
      }
      onClose();
      form.resetFields();
    } catch (err) {
      error("Failed to save vendor");
    }
  };

  return (
    <GenericDrawer
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Vendor" : "Add Vendor"}
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

export default AddEditVendorDrawer;
