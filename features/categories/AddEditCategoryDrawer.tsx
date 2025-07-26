"use client";
import { Form } from "antd";
import React from "react";
import { Category } from "@/features/categories/types";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/categories/api";
import { useNotification } from "@/hooks/useNotification";
import { GenericDrawer, type FormField } from "@/components/common";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  category?: Category | null;
  onClose?: () => void;
}

export default function AddEditCategoryDrawer({
  open,
  setOpen,
  category,
  onClose,
}: Props) {
  const [form] = Form.useForm<Category>();
  const { success, error: showError } = useNotification();

  // API hooks
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  const isEditing = !!category;
  const isLoading = isCreating || isUpdating;

  // Define form fields using the generic interface
  const fields: FormField[] = [
    {
      name: "categoryId",
      label: "Category ID",
      type: "input",
      placeholder: "Enter Category ID",
      rules: [{ required: true, message: "Please enter category ID" }],
    },
    {
      name: "categoryName",
      label: "Category Name",
      type: "input",
      placeholder: "Enter Category Name",
      rules: [{ required: true, message: "Please enter category name" }],
    },
    {
      name: "vatStatus",
      label: "VAT Status",
      type: "select",
      placeholder: "Select VAT status",
      options: [
        { label: "VAT Enabled", value: true },
        { label: "VAT Disabled", value: false },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Enter Description",
    },
  ];

  const handleSubmit = async (values: Category) => {
    try {
      if (isEditing && category) {
        await updateCategory({
          _id: category._id,
          category: values,
        }).unwrap();
        success("Category updated successfully");
      } else {
        await createCategory(values).unwrap();
        success("Category created successfully");
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
          "Failed to save category",
          (error.data as { message: string }).message,
        );
      } else {
        showError("Failed to save category");
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
      title={isEditing ? "Edit Category" : "Add New Category"}
      form={form}
      fields={fields}
      initialValues={
        category
          ? {
              categoryId: category.categoryId,
              categoryName: category.categoryName,
              vatStatus: category.vatStatus,
              description: category.description,
            }
          : undefined
      }
      onSubmit={handleSubmit}
      loading={isLoading}
      submitText={isEditing ? "Update" : "Save"}
    />
  );
}
