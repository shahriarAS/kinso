import React, { useMemo } from "react";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "./api";
import { Category, CategoryInput } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { Form } from "antd";
import { GenericDrawer, FormField } from "@/components/common";

interface AddEditCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

const AddEditCategoryDrawer: React.FC<AddEditCategoryDrawerProps> = ({
  open,
  onClose,
  category,
}) => {
  const [form] = Form.useForm<CategoryInput>();
  const { success, error } = useNotification();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  const isEditing = !!category;

  // Define form fields for GenericDrawer
  const fields: FormField[] = useMemo(
    () => [
      {
        name: "name",
        label: "Category Name",
        type: "input",
        placeholder: "Enter category name",
        rules: [{ required: true, message: "Please enter category name" }],
      },
      {
        name: "applyVAT",
        label: "Apply VAT",
        type: "select",
        placeholder: "Select category type",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    ],
    [],
  );

  // Set initial values for edit mode
  const initialValues =
    isEditing && category
      ? { name: category.name, applyVAT: category.applyVAT }
      : undefined;

  const handleSubmit = async (values: CategoryInput) => {
    try {
      if (isEditing && category) {
        await updateCategory({ _id: category._id, category: values }).unwrap();
        success("Category updated successfully");
      } else {
        await createCategory(values).unwrap();
        success("Category created successfully");
      }
      onClose();
      form.resetFields();
    } catch (err) {
      error("Failed to save category");
    }
  };

  return (
    <GenericDrawer
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Category" : "Add Category"}
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

export default AddEditCategoryDrawer;
