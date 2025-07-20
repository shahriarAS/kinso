"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Form, Input } from "antd";
import React, { useEffect } from "react";
import { Warehouse } from "@/types";
import {
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
} from "@/store/api/warehouses";
import toast from "react-hot-toast";

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

  // API hooks
  const [createWarehouse, { isLoading: isCreating }] =
    useCreateWarehouseMutation();
  const [updateWarehouse, { isLoading: isUpdating }] =
    useUpdateWarehouseMutation();

  const isEditing = !!warehouse;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (warehouse && open) {
      form.setFieldsValue({
        name: warehouse.name,
        location: warehouse.location,
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [warehouse, open, form]);

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

      if (isEditing && warehouse) {
        await updateWarehouse({
          _id: warehouse._id,
          warehouse: values,
        }).unwrap();
        toast.success("Warehouse updated successfully");
      } else {
        await createWarehouse(values).unwrap();
        toast.success("Warehouse created successfully");
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
        toast.error("Failed to save warehouse");
      }
    }
  };

  return (
    <div>
      <Drawer
        title={isEditing ? "Edit Warehouse" : "Add New Warehouse"}
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
          name="warehouse-add"
          layout="vertical"
          requiredMark={false}
          className="border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
        >
          <Form.Item
            name="name"
            label="Warehouse Name"
            rules={[{ required: true, message: "Please enter warehouse name" }]}
            className="font-medium"
          >
            <Input
              size="large"
              placeholder="Enter Warehouse Name"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter location" }]}
            className="font-medium"
          >
            <Input
              size="large"
              placeholder="Enter Location"
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
