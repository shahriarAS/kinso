"use client";
import { useState } from "react";
import { Modal, Form, Input, Select, Button, message } from "antd";
import { useGenerateDemandsMutation } from "@/features/demand/api";
import { useGetOutletsQuery } from "@/features/outlets/api";
import { useNotification } from "@/hooks/useNotification";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DemandGenerationModal({ open, onClose, onSuccess }: Props) {
  const [form] = Form.useForm();
  const { success, error: showError } = useNotification();
  const [generateDemands, { isLoading: isGenerating }] = useGenerateDemandsMutation();

  // Fetch outlets for dropdown
  const { data: outletsData } = useGetOutletsQuery({
    page: 1,
    limit: 1000,
    sortBy: "name",
    sortOrder: "asc",
  });

  const handleSubmit = async (values: any) => {
    try {
      const result = await generateDemands({
        outletId: values.outletId,
        warehouseId: values.warehouseId,
        days: values.days || 30,
        minSalesThreshold: values.minSalesThreshold || 1,
      }).unwrap();

      success(`Successfully generated ${result.generatedCount} demands`);
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
          "Failed to generate demands",
          (error.data as { message: string }).message,
        );
      } else {
        showError("Failed to generate demands");
      }
    }
  };

  return (
    <Modal
      title="Generate Demands from Sales Data"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div className="mb-4 p-4 bg-blue-50 rounded border border-blue-200">
        <h4 className="font-medium mb-2 text-blue-800">Simplified Algorithm</h4>
        <div className="text-sm text-blue-700">
          <p>This uses a simplified demand generation algorithm based on:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Average daily sales over the specified period</li>
            <li>Generates demand for 7 days of average sales</li>
            <li>Only considers products that meet the minimum sales threshold</li>
            <li>Does not consider current stock levels or seasonal trends</li>
          </ul>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          days: 30,
          minSalesThreshold: 1,
        }}
      >
        <Form.Item
          name="outletId"
          label="Outlet (Optional)"
          rules={[{ required: false }]}
        >
          <Select
            placeholder="Select outlet (leave empty for all outlets)"
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
          label="Warehouse ID (Optional)"
          rules={[{ required: false }]}
        >
          <Input placeholder="Enter warehouse ID (leave empty for all warehouses)" />
        </Form.Item>

        <Form.Item
          name="days"
          label="Analysis Period (Days)"
          rules={[
            { required: true, message: "Please enter analysis period" },
            { type: "number", min: 1, max: 365, message: "Days must be between 1 and 365" },
          ]}
        >
          <Input
            type="number"
            min={1}
            max={365}
            placeholder="Number of days to analyze sales data"
          />
        </Form.Item>

        <Form.Item
          name="minSalesThreshold"
          label="Minimum Sales Threshold"
          rules={[
            { required: true, message: "Please enter minimum sales threshold" },
            { type: "number", min: 1, message: "Threshold must be at least 1" },
          ]}
        >
          <Input
            type="number"
            min={1}
            placeholder="Minimum total sales to consider for demand generation"
          />
        </Form.Item>

        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isGenerating}
            onClick={() => form.submit()}
          >
            Generate Demands
          </Button>
        </div>
      </Form>
    </Modal>
  );
} 