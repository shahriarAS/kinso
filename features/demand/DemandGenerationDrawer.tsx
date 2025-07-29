"use client";

import React, { useState } from "react";
import { Form, Table, Card, InputNumber, Alert, Select } from "antd";
import { DemandGenerationRequest } from "./types";
import { useGetProductsQuery } from "@/features/products";
import { useGetWarehousesQuery } from "@/features/warehouses";
import { useGetOutletsQuery } from "@/features/outlets/api";
import GenericDrawer, { FormField } from "@/components/common/GenericDrawer";

interface DemandGenerationDrawerProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (data: DemandGenerationRequest) => void;
  loading: boolean;
}

interface ProductDemand {
  product: string;
  productName: string;
  currentStock: number;
  minStock: number;
  suggestedQuantity: number;
}

interface FormValues {
  locationType: "Warehouse" | "Outlet";
  location: string;
}

export const DemandGenerationDrawer: React.FC<DemandGenerationDrawerProps> = ({
  open,
  onClose,
  onGenerate,
  loading,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [generatedProducts, setGeneratedProducts] = useState<ProductDemand[]>(
    [],
  );
  const [showGenerated, setShowGenerated] = useState(false);

  // API hooks
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery({});
  const { data: warehousesData } = useGetWarehousesQuery({});
  const { data: outletsData } = useGetOutletsQuery({});

  const handleGenerateDemand = async () => {
    try {
      const values = await form.validateFields();

      // Mock algorithm for demand generation based on sales trends
      const mockGeneratedProducts: ProductDemand[] = (productsData?.data || [])
        .slice(0, 10) // Take first 10 products for demo
        .map((product) => {
          // Mock calculation based on sales trends
          const currentStock = Math.floor(Math.random() * 100) + 10;
          const minStock = Math.floor(Math.random() * 20) + 5;
          const suggestedQuantity = Math.max(0, minStock * 2 - currentStock);

          return {
            product: product._id,
            productName: product.name,
            currentStock,
            minStock,
            suggestedQuantity,
          };
        })
        .filter((p) => p.suggestedQuantity > 0); // Only products that need restocking

      setGeneratedProducts(mockGeneratedProducts);
      setShowGenerated(true);
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const updateQuantity = (index: number, quantity: number) => {
    const updated = [...generatedProducts];
    updated[index].suggestedQuantity = quantity;
    setGeneratedProducts(updated);
  };

  const handleFormSubmit = async (values: FormValues) => {
    if (!showGenerated) {
      // First step: generate demand
      await handleGenerateDemand();
      return;
    }

    // Second step: create demand (only if we have products with quantities)
    if (totalQuantity === 0) {
      return;
    }

    const demandData: DemandGenerationRequest = {
      location: values.location,
      locationType: values.locationType,
      products: generatedProducts.map((p) => ({
        product: p.product,
        currentStock: p.currentStock,
        minStock: p.minStock,
        suggestedQuantity: p.suggestedQuantity,
      })),
    };

    await onGenerate(demandData);
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (stock: number) => (
        <span className={stock < 20 ? "text-red-600 font-medium" : ""}>
          {stock}
        </span>
      ),
    },
    {
      title: "Min Stock",
      dataIndex: "minStock",
      key: "minStock",
    },
    {
      title: "Suggested Quantity",
      dataIndex: "suggestedQuantity",
      key: "suggestedQuantity",
      render: (quantity: number, record: ProductDemand, index: number) => (
        <InputNumber
          min={0}
          value={quantity}
          onChange={(val) => updateQuantity(index, val || 0)}
          className="w-20"
        />
      ),
    },
    {
      title: "Priority",
      key: "priority",
      render: (_: any, record: ProductDemand) => {
        const priority =
          record.currentStock <= record.minStock ? "High" : "Medium";
        const color = priority === "High" ? "red" : "orange";
        return (
          <span className={`text-${color}-600 font-medium`}>{priority}</span>
        );
      },
    },
  ];

  const totalQuantity = generatedProducts.reduce(
    (sum, p) => sum + p.suggestedQuantity,
    0,
  );

  const fields: FormField[] = [
    {
      name: "locationType",
      label: "Location Type",
      type: "select",
      rules: [{ required: true, message: "Please select location type" }],
      options: [
        { label: "Warehouse", value: "Warehouse" },
        { label: "Outlet", value: "Outlet" },
      ],
      placeholder: "Select location type",
    },
    {
      name: "location",
      label: "Location",
      type: "custom",
      rules: [{ required: true, message: "Please select location" }],
      render: (form) => (
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.locationType !== currentValues.locationType
          }
        >
          {({ getFieldValue }) => {
            const locationType = getFieldValue("locationType");
            const locations =
              locationType === "Warehouse"
                ? warehousesData?.data || []
                : outletsData?.data || [];

            return (
              <Select
                placeholder="Select location"
                showSearch
                filterOption={(input, option) =>
                  (option?.label as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={locations.map((location: any) => ({
                  label: location.name,
                  value: location._id,
                }))}
              />
            );
          }}
        </Form.Item>
      ),
    },
  ];

  return (
    <GenericDrawer<FormValues>
      open={open}
      onClose={() => {
        setShowGenerated(false);
        setGeneratedProducts([]);
        onClose();
      }}
      title="Generate Demand"
      width={900}
      form={form}
      fields={fields}
      initialValues={{ locationType: "Warehouse" }}
      onSubmit={handleFormSubmit}
      submitText={
        showGenerated
          ? `Create Demand (${totalQuantity} items)`
          : "Generate Demand"
      }
      loading={loading || productsLoading}
      gridCols={2}
      extra={null}
    >
      {/* Algorithm Info */}
      <Alert
        message="Demand Generation Algorithm"
        description="This algorithm calculates demand based on current stock levels, minimum stock requirements, and sales trends. Products below minimum stock are prioritized."
        type="info"
        showIcon
        className="mb-6"
      />

      {/* Generated Demand */}
      {showGenerated && (
        <Card
          title={
            <div className="flex items-center justify-between">
              <span>Generated Demand</span>
              <span className="text-sm text-gray-500">
                {generatedProducts.length} products • {totalQuantity} total
                quantity
              </span>
            </div>
          }
          size="small"
          className="mt-6"
        >
          {generatedProducts.length > 0 ? (
            <>
              <div className="mb-4">
                <Alert
                  message={`${generatedProducts.length} products need restocking`}
                  description="You can adjust the suggested quantities before creating the demand."
                  type="success"
                  showIcon
                />
              </div>
              <Table
                dataSource={generatedProducts.map((item, index) => ({
                  ...item,
                  key: index,
                }))}
                columns={columns}
                pagination={false}
                size="small"
                bordered
              />
            </>
          ) : (
            <Alert
              message="No demand generated"
              description="All products are sufficiently stocked based on current algorithm parameters."
              type="success"
              showIcon
            />
          )}
        </Card>
      )}
    </GenericDrawer>
  );
};
