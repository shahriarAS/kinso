"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Form, Input } from "antd";
import React, { useEffect } from "react";
import { Category } from "@/features/categories/types";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/categories/api";
import toast from "react-hot-toast";

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

  // API hooks
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  const isEditing = !!category;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (category && open) {
      form.setFieldsValue({
        name: category.name,
        description: category.description,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [category, open, form]);

  const handleClose = () => {
    setOpen(false);
    form.resetFields();
    if (onClose) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && category) {
        await updateCategory({
          _id: category._id,
          category: values,
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory(values).unwrap();
        toast.success("Category created successfully");
      }

      handleClose();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        toast.error((error.data as { message: string }).message);
      } else if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation error
        return;
      } else {
        toast.error("Failed to save category");
      }
    }
  };

  return (
    <div>
      <Drawer
        title={isEditing ? "Edit Category" : "Add New Category"}
        open={open}
        onClose={handleClose}
        width={480}
        className="rounded-3xl"
        getContainer={false}
        destroyOnHidden={true}
        closeIcon={<Icon icon="lineicons:close" className="font-extrabold" />}
        extra={
          <div className="flex gap-4 justify-end">
            <Button type="default" onClick={handleClose} disabled={isLoading}>
              Discard
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={isLoading}>
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          name="category-add"
          layout="vertical"
          requiredMark={false}
          className="border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
            className="font-medium"
          >
            <Input
              size="large"
              placeholder="Enter Category Name"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            className="font-medium"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter Description"
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
