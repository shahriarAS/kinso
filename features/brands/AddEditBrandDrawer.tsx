import React, { useMemo } from "react";
import { useCreateBrandMutation, useUpdateBrandMutation } from "./api";
import { useGetAllVendorsQuery } from "@/features/vendors/api";
import { Brand, BrandInput } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { Form } from "antd";
import { GenericDrawer, FormField } from "@/components/common";

import { Vendor } from "../vendors/types";

interface AddEditBrandDrawerProps {
  open: boolean;
  onClose: () => void;
  brand?: Brand | null;
}

const AddEditBrandDrawer: React.FC<AddEditBrandDrawerProps> = ({
  open,
  onClose,
  brand,
}) => {
  const [form] = Form.useForm<BrandInput>();
  const { success, error } = useNotification();
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();
  const { data: vendorsResponse } = useGetAllVendorsQuery();

  const isEditing = !!brand;

  // Define form fields for GenericDrawer
  const fields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Brand Name",
        type: "input",
        placeholder: "Enter brand name",
        rules: [
          { required: true, message: "Please enter brand name" },
          { min: 2, message: "Brand name must be at least 2 characters" },
        ],
      },
      {
        name: "vendor",
        label: "Vendor",
        type: "select",
        placeholder: "Select vendor",
        options:
          vendorsResponse?.data?.map((vendor: Vendor) => ({
            label: vendor.name,
            value: vendor._id,
          })) || [],
        rules: [{ required: true, message: "Please select a vendor" }],
      },
    ],
    [vendorsResponse?.data],
  );

  // Set initial values for edit mode
  const initialValues = brand
    ? {
        name: brand.name,
        vendor: brand.vendor._id,
      }
    : undefined;

  const handleSubmit = async (values: BrandInput) => {
    if (isEditing && brand) {
      await updateBrand({
        _id: brand._id,
        brand: values,
      }).unwrap();
      success("Brand updated successfully");
    } else {
      await createBrand(values).unwrap();
      success("Brand created successfully");
    }
  };

  return (
    <GenericDrawer<BrandInput>
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Brand" : "Add Brand"}
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

export default AddEditBrandDrawer;
