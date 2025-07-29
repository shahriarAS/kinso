"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Form,
  Table,
  InputNumber,
  Button,
  Divider,
  message,
  Select,
  Drawer,
  Row,
  Col,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Demand, DemandInput } from "./types";
import { useGetProductsQuery } from "@/features/products";
import { useGetWarehousesQuery } from "@/features/warehouses";
import { useGetOutletsQuery } from "@/features/outlets/api";

interface AddEditDemandDrawerProps {
  demand: Demand | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DemandInput) => void;
  loading: boolean;
}

export const AddEditDemandDrawer: React.FC<AddEditDemandDrawerProps> = ({
  demand,
  open,
  onClose,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState<
    Array<{ product: string; quantity: number }>
  >([]);

  // API hooks
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery({});
  const { data: warehousesData, isLoading: warehousesLoading } =
    useGetWarehousesQuery({});
  const { data: outletsData } = useGetOutletsQuery({});

  useEffect(() => {
    if (demand) {
      setProducts(
        demand.products.map((p) => ({
          product: p.product._id,
          quantity: p.quantity,
        })),
      );
      // Reset form with demand data
      form.setFieldsValue({
        location: demand.location,
        locationType: demand.locationType,
        status: demand.status,
      });
    } else {
      setProducts([]);
      // Reset form for new demand
      form.resetFields();
    }
  }, [demand, form]);

  // Reset form and products when drawer closes
  useEffect(() => {
    if (!open) {
      form.resetFields();
      setProducts([]);
    }
  }, [open, form]);

  const handleSubmit = async (values: any) => {
    if (products.length === 0) {
      message.error("Please add at least one product");
      return;
    }

    // Validate that all products have been selected
    const hasEmptyProducts = products.some(p => !p.product);
    if (hasEmptyProducts) {
      message.error("Please select all products");
      return;
    }

    const demandData: DemandInput = {
      location: values.location,
      locationType: values.locationType,
      status: values.status || "Pending",
      products,
    };

    onSubmit(demandData);
  };

  const addProduct = useCallback(() => {
    setProducts([...products, { product: "", quantity: 1 }]);
  }, [products]);

  const updateProduct = useCallback((index: number, field: string, value: any) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  }, [products]);

  const removeProduct = useCallback((index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  }, [products]);

  const productColumns = useMemo(() => [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (value: string, record: any, index: number) => (
        <Select
          value={value || undefined}
          onChange={(val) => updateProduct(index, "product", val)}
          placeholder="Select product"
          showSearch
          filterOption={(input, option) =>
            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
          }
          options={productsData?.data?.map((product) => ({
            label: `${product.name} - ${product.barcode}`,
            value: product._id,
          })) || []}
          className="w-full"
        />
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (value: number, record: any, index: number) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => updateProduct(index, "quantity", val || 1)}
          className="w-full"
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_: any, record: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeProduct(index)}
          size="small"
        />
      ),
    },
  ], [productsData?.data, updateProduct, removeProduct]);

  const initialValues = demand
    ? {
        location: demand.location,
        locationType: demand.locationType,
        status: demand.status,
      }
    : {
        locationType: undefined,
        location: undefined,
      };

  const ProductsSection = useMemo(() => (
    <>
      <Divider orientation="left">Products</Divider>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Products List</h4>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addProduct}
            disabled={productsLoading}
          >
            Add Product
          </Button>
        </div>

        <Table
          dataSource={products.map((product, index) => ({
            ...product,
            key: index,
          }))}
          columns={productColumns}
          pagination={false}
          size="small"
          locale={{
            emptyText: "No products added. Click 'Add Product' to start.",
          }}
        />

        {products.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between">
              <span className="font-medium">Total Items:</span>
              <span className="font-bold">{products.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total Quantity:</span>
              <span className="font-bold text-blue-600">
                {products.reduce((sum, p) => sum + (p.quantity || 0), 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  ), [products, productsLoading, addProduct, productColumns]);

  return (
    <Drawer
      title={demand ? "Edit Demand" : "Create New Demand"}
      open={open}
      onClose={onClose}
      width={800}
      styles={{
        body: { paddingBottom: 80 },
      }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={() => form.submit()} 
              loading={loading}
            >
              {demand ? "Update" : "Create"}
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="locationType"
              label="Location Type"
              rules={[{ required: true, message: "Please select location type" }]}
            >
              <Select
                size="large"
                placeholder="Select location type"
                options={[
                  { label: "Warehouse", value: "Warehouse" },
                  { label: "Outlet", value: "Outlet" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
              prevValues.locationType !== currentValues.locationType
            }>
              {({ getFieldValue }) => {
                const locationType = getFieldValue('locationType');
                const locations = locationType === "Warehouse" 
                  ? warehousesData?.data || []
                  : outletsData?.data || [];
                
                return (
                  <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true, message: "Please select location" }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select location"
                      showSearch
                      loading={locationType === "Warehouse" ? warehousesLoading : false}
                      filterOption={(input, option) =>
                        (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                      options={locations.map((location: any) => ({
                        label: location.name,
                        value: location._id,
                      }))}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Col>
        </Row>

        {demand && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select
                  size="large"
                  placeholder="Select status"
                  options={[
                    { label: "Pending", value: "Pending" },
                    { label: "Approved", value: "Approved" },
                    { label: "Converted to Stock", value: "ConvertedToStock" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {ProductsSection}
      </Form>
    </Drawer>
  );
};
