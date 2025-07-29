"use client";
import { useEffect, useState } from "react";
import { Drawer, Form, Input, DatePicker, Select, Button, message } from "antd";
import { useCreateDemandMutation, useUpdateDemandMutation } from "@/features/demand/api";
import { useGetProductsQuery } from "@/features/products/api";
import { useGetOutletsQuery } from "@/features/outlets/api";
import type { Demand, DemandInput } from "@/features/demand/types";
import { useNotification } from "@/hooks/useNotification";

interface Props {
  open: boolean;
  demand?: Demand | null;
  onClose: () => void;
}

export default function AddEditDemandDrawer({ open, demand, onClose }: Props) {
  const [form] = Form.useForm();
  const { success, error: showError } = useNotification();
  const [createDemand, { isLoading: isCreating }] = useCreateDemandMutation();
  const [updateDemand, { isLoading: isUpdating }] = useUpdateDemandMutation();

  // Fetch products and outlets for dropdowns
  const { data: productsData } = useGetProductsQuery({
    page: 1,
    limit: 1000,
    sortBy: "name",
    sortOrder: "asc",
  });

  const { data: outletsData } = useGetOutletsQuery({
    page: 1,
    limit: 1000,
    sortBy: "name",
    sortOrder: "asc",
  });

  const isEditing = !!demand;

  useEffect(() => {
    if (open) {
      if (isEditing && demand) {
        form.setFieldsValue({
          outletId: demand.outletId,
          warehouseId: demand.warehouseId,
          product: demand.product,
          quantity: demand.quantity,
          demandDate: demand.demandDate ? demand.demandDate : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, isEditing, demand, form]);

  const handleSubmit = async (values: any) => {
    try {
      const demandData: DemandInput = {
        outletId: values.outletId,
        warehouseId: values.warehouseId,
        product: values.product,
        quantity: values.quantity,
        demandDate: values.demandDate?.format("YYYY-MM-DD"),
      };

      if (isEditing && demand) {
        await updateDemand({ _id: demand._id, demand: demandData }).unwrap();
        success("Demand updated successfully");
      } else {
        await createDemand(demandData).unwrap();
        success("Demand created successfully");
      }

      form.resetFields();
      onClose();
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
          `Failed to ${isEditing ? "update" : "create"} demand`,
          (error.data as { message: string }).message,
        );
      } else {
        showError(`Failed to ${isEditing ? "update" : "create"} demand`);
      }
    }
  };

  return (
    <Drawer
      title={isEditing ? "Edit Demand" : "Create New Demand"}
      width={600}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isCreating || isUpdating}
            onClick={() => form.submit()}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quantity: 1,
        }}
      >
        <Form.Item
          name="outletId"
          label="Outlet"
          rules={[{ required: false }]}
        >
          <Select
            placeholder="Select outlet (optional)"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {outletsData?.data?.map((outlet) => (
              <Select.Option key={outlet._id} value={outlet._id}>
                {outlet.name} ({outlet.outletId})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="warehouseId"
          label="Warehouse ID"
          rules={[{ required: false }]}
        >
          <Input placeholder="Enter warehouse ID (optional)" />
        </Form.Item>

        <Form.Item
          name="product"
          label="Product"
          rules={[{ required: true, message: "Please select a product" }]}
        >
          <Select
            placeholder="Select product"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children as unknown as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {productsData?.data?.map((product) => (
              <Select.Option key={product._id} value={product._id}>
                {product.name} ({product.barcode})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[
            { required: true, message: "Please enter quantity" },
            { type: "number", min: 1, message: "Quantity must be at least 1" },
          ]}
        >
          <Input type="number" min={1} placeholder="Enter quantity" />
        </Form.Item>

        <Form.Item
          name="demandDate"
          label="Demand Date"
          rules={[{ required: true, message: "Please select demand date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select demand date"
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
} 