"use client";
import { useState, useEffect } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useConvertDemandToStockMutation } from "@/features/demand/api";
import { useGetProductQuery } from "@/features/products/api";
import type { Demand } from "@/features/demand/types";
import { useNotification } from "@/hooks/useNotification";

interface Props {
  open: boolean;
  demand: Demand | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConvertDemandModal({ open, demand, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const { success, error: showError } = useNotification();
  const [convertDemand, { isLoading: isConverting }] = useConvertDemandToStockMutation();

  // Fetch product details to get available warehouses
  const { data: productData } = useGetProductQuery(demand?.product || "", {
    skip: !demand?.product,
  });

  const [availableWarehouses, setAvailableWarehouses] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (productData?.data?.stock) {
      const warehouses = productData.data.stock.map((stock: any) => ({
        id: stock.warehouse,
        name: `Warehouse ${stock.warehouse}`,
      }));
      setAvailableWarehouses(warehouses);
    }
  }, [productData]);

  useEffect(() => {
    if (open && demand) {
      form.setFieldsValue({
        quantity: demand.quantity,
        warehouseId: availableWarehouses[0]?.id,
      });
    }
  }, [open, demand, form, availableWarehouses]);

  const handleSubmit = async (values: any) => {
    if (!demand) return;

    try {
      await convertDemand({
        demand: demand._id,
        warehouseId: values.warehouseId,
        quantity: values.quantity,
      }).unwrap();

      success("Demand converted to stock successfully");
      form.resetFields();
      onClose();
      onSuccess();
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
          "Failed to convert demand to stock",
          (error.data as { message: string }).message,
        );
      } else {
        showError("Failed to convert demand to stock");
      }
    }
  };

  if (!demand) return null;

  return (
    <Modal
      title="Convert Demand to Stock"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <div className="mb-4 p-4 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Demand Details</h4>
        <div className="text-sm text-gray-600">
          <div><strong>Demand ID:</strong> {demand.demand}</div>
          <div><strong>Product:</strong> {(demand.product as any)?.name || "N/A"}</div>
          <div><strong>Requested Quantity:</strong> {demand.quantity}</div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          quantity: demand.quantity,
        }}
      >
        <Form.Item
          name="warehouseId"
          label="Target Warehouse"
          rules={[{ required: true, message: "Please select a warehouse" }]}
        >
          <Select placeholder="Select warehouse">
            {availableWarehouses.map((warehouse) => (
              <Select.Option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity to Add"
          rules={[
            { required: true, message: "Please enter quantity" },
            { type: "number", min: 1, message: "Quantity must be at least 1" },
            {
              validator: (_, value) => {
                if (value > demand.quantity) {
                  return Promise.reject(new Error(`Quantity cannot exceed demand quantity (${demand.quantity})`));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            min={1}
            max={demand.quantity}
            placeholder={`Enter quantity (max: ${demand.quantity})`}
          />
        </Form.Item>

        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isConverting}
            onClick={() => form.submit()}
          >
            Convert to Stock
          </Button>
        </div>
      </Form>
    </Modal>
  );
} 