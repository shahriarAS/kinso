"use client";

import React, { useState, useEffect } from "react";
import {
  Drawer,
  InputNumber,
  Input,
  DatePicker,
  Button,
  Table,
  Alert,
  Divider,
  Card,
  message,
  Popconfirm,
} from "antd";
import { CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { Icon } from "@iconify/react";
import { Demand, DemandConversionRequest } from "./types";
import dayjs from "dayjs";

interface ConvertDemandDrawerProps {
  demand: Demand | null;
  open: boolean;
  onClose: () => void;
  onConvert: (
    demandId: string,
    conversionData: DemandConversionRequest,
  ) => void;
  loading: boolean;
}

interface ProductStockInfo {
  productId: string;
  quantity: number;
  mrp: number;
  tp: number;
  expireDate: string;
  batchNumber: string;
}

export const ConvertDemandDrawer: React.FC<ConvertDemandDrawerProps> = ({
  demand,
  open,
  onClose,
  onConvert,
  loading,
}) => {
  const [productStockData, setProductStockData] = useState<
    Record<string, ProductStockInfo>
  >({});
  const [removedProducts, setRemovedProducts] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (demand && open) {
      // Initialize product stock data
      const initialData: Record<string, ProductStockInfo> = {};
      demand.products.forEach((product) => {
        initialData[product.product._id] = {
          productId: product.product._id,
          quantity: product.quantity,
          mrp: 0,
          tp: 0,
          expireDate: "",
          batchNumber: "",
        };
      });
      setProductStockData(initialData);
      setRemovedProducts(new Set()); // Reset removed products when opening
    }
  }, [demand, open]);

  if (!demand) return null;

  const updateProductStockInfo = (
    productId: string,
    field: keyof ProductStockInfo,
    value: any,
  ) => {
    setProductStockData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const removeProduct = (productId: string) => {
    setRemovedProducts((prev) => new Set([...prev, productId]));
  };

  const restoreProduct = (productId: string) => {
    setRemovedProducts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const getIncludedProducts = () => {
    return (
      demand?.products.filter(
        (product) => !removedProducts.has(product.product._id),
      ) || []
    );
  };

  const validateAllProducts = () => {
    const includedProducts = getIncludedProducts();

    if (includedProducts.length === 0) {
      return false;
    }

    for (const product of includedProducts) {
      const stockInfo = productStockData[product.product._id];
      if (
        !stockInfo ||
        !stockInfo.quantity ||
        !stockInfo.mrp ||
        !stockInfo.tp ||
        !stockInfo.expireDate ||
        !stockInfo.batchNumber
      ) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    const includedProducts = getIncludedProducts();

    if (includedProducts.length === 0) {
      message.error("At least one product must be included for conversion");
      return;
    }

    if (!validateAllProducts()) {
      message.error(
        "Please fill in all stock information for all included products",
      );
      return;
    }

    const conversionData: DemandConversionRequest = {
      products: includedProducts
        .map((product) => productStockData[product.product._id])
        .filter(Boolean),
    };

    onConvert(demand._id, conversionData);
  };

  const productColumns = [
    {
      title: "Product Name",
      dataIndex: ["product", "name"],
      key: "productName",
      render: (name: string) => <span className="font-medium">{name}</span>,
      width: 200,
    },
    {
      title: "Barcode",
      dataIndex: ["product", "barcode"],
      key: "barcode",
      width: 120,
    },
    {
      title: "Category",
      dataIndex: ["product", "category", "name"],
      key: "category",
      width: 120,
    },
    {
      title: "Quantity",
      key: "quantity",
      width: 100,
      render: (_: any, record: any) => (
        <InputNumber
          placeholder="Qty"
          min={1}
          value={productStockData[record.product._id]?.quantity}
          onChange={(value) =>
            updateProductStockInfo(record.product._id, "quantity", value || 1)
          }
          className="w-full"
          size="small"
          disabled={removedProducts.has(record.product._id)}
        />
      ),
    },
    {
      title: "MRP (₹)",
      key: "mrp",
      width: 120,
      render: (_: any, record: any) => (
        <InputNumber
          placeholder="MRP"
          min={0}
          step={0.01}
          value={productStockData[record.product._id]?.mrp}
          onChange={(value) =>
            updateProductStockInfo(record.product._id, "mrp", value || 0)
          }
          className="w-full"
          size="small"
          disabled={removedProducts.has(record.product._id)}
        />
      ),
    },
    {
      title: "TP (₹)",
      key: "tp",
      width: 120,
      render: (_: any, record: any) => (
        <InputNumber
          placeholder="TP"
          min={0}
          step={0.01}
          value={productStockData[record.product._id]?.tp}
          onChange={(value) =>
            updateProductStockInfo(record.product._id, "tp", value || 0)
          }
          className="w-full"
          size="small"
          disabled={removedProducts.has(record.product._id)}
        />
      ),
    },
    {
      title: "Expire Date",
      key: "expireDate",
      width: 140,
      render: (_: any, record: any) => (
        <DatePicker
          placeholder="Expire Date"
          size="small"
          className="w-full"
          value={
            productStockData[record.product._id]?.expireDate
              ? dayjs(productStockData[record.product._id].expireDate)
              : null
          }
          onChange={(date) =>
            updateProductStockInfo(
              record.product._id,
              "expireDate",
              date ? date.format("YYYY-MM-DD") : "",
            )
          }
          disabledDate={(current) => current && current < dayjs().endOf("day")}
          format="YYYY-MM-DD"
          disabled={removedProducts.has(record.product._id)}
        />
      ),
    },
    {
      title: "Batch Number",
      key: "batchNumber",
      width: 140,
      render: (_: any, record: any) => (
        <Input
          placeholder="Batch No."
          size="small"
          value={productStockData[record.product._id]?.batchNumber}
          onChange={(e) =>
            updateProductStockInfo(
              record.product._id,
              "batchNumber",
              e.target.value,
            )
          }
          maxLength={50}
          disabled={removedProducts.has(record.product._id)}
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      fixed: "right" as const,
      render: (_: any, record: any) => {
        const isRemoved = removedProducts.has(record.product._id);

        if (isRemoved) {
          return (
            <Button
              type="link"
              size="small"
              onClick={() => restoreProduct(record.product._id)}
              className="text-green-600 hover:text-green-500"
            >
              Restore
            </Button>
          );
        }

        return (
          <Popconfirm
            title="Remove Product"
            description="Are you sure you want to remove this product from conversion?"
            onConfirm={() => removeProduct(record.product._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              className="text-red-500 hover:text-red-400"
            />
          </Popconfirm>
        );
      },
    },
  ];

  const totalQuantity = getIncludedProducts().reduce((sum, p) => {
    const stockInfo = productStockData[p.product._id];
    return sum + (stockInfo?.quantity || p.quantity);
  }, 0);

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <Icon icon={"mingcute:transfer-line"} className="text-blue-600" />
          <span className="text-lg font-semibold">Convert Demand to Stock</span>
        </div>
      }
      width={1200}
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined />}
      extra={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            Convert to Stock
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Demand Summary */}
        <Card title="Demand Summary" size="small">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-gray-500">Location:</span>
              <div className="font-medium">
                {typeof demand.location === "string"
                  ? demand.location
                  : demand.location?.name || "N/A"}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <div className="font-medium">{demand.locationType}</div>
            </div>
            <div>
              <span className="text-gray-500">Products to Convert:</span>
              <div className="font-medium">
                {getIncludedProducts().length} of {demand.products.length}
                {removedProducts.size > 0 && (
                  <span className="text-orange-500 text-sm ml-1">
                    ({removedProducts.size} excluded)
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Total Quantity:</span>
              <div className="font-medium text-blue-600">{totalQuantity}</div>
            </div>
          </div>
        </Card>

        <Divider orientation="left">Individual Product Configuration</Divider>

        {/* Products with Stock Information */}
        <Card title="Configure Stock Details for Each Product" size="small">
          {removedProducts.size > 0 && (
            <Alert
              message={`${removedProducts.size} product(s) excluded from conversion`}
              type="warning"
              showIcon
              className="mb-4"
              action={
                <Button
                  size="small"
                  type="link"
                  onClick={() => setRemovedProducts(new Set())}
                >
                  Restore All
                </Button>
              }
            />
          )}
          <Table
            dataSource={demand.products}
            columns={productColumns}
            pagination={false}
            size="small"
            rowKey={(record) => record.product._id}
            scroll={{ x: 1100 }}
            rowClassName={(record) =>
              removedProducts.has(record.product._id)
                ? "opacity-50 bg-gray-50"
                : ""
            }
          />
        </Card>
      </div>
    </Drawer>
  );
};
