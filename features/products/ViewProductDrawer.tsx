"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Descriptions, Table, Tag, Divider } from "antd";
import React from "react";
import { Product } from "@/features/products/types";
import { Warehouse } from "@/features/warehouses";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product?: Product | null;
  onClose?: () => void;
}

export default function ViewProductDrawer({
  open,
  setOpen,
  product,
  onClose,
}: Props) {
  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const getStockStatus = (stock: Product["stock"]) => {
    const totalStock = stock.reduce((sum, item) => sum + item.unit, 0);
    if (totalStock === 0)
      return { status: "out_of_stock", color: "red", text: "Out of Stock" };
    if (totalStock <= 10)
      return { status: "low_stock", color: "orange", text: "Low Stock" };
    return { status: "in_stock", color: "green", text: "In Stock" };
  };

  const getTotalStock = (stock: Product["stock"]) => {
    return stock.reduce((sum, item) => sum + item.unit, 0);
  };

  const stockColumns = [
    {
      title: <span className="font-medium text-base">Warehouse</span>,
      dataIndex: ["warehouse", "name"],
      key: "warehouse",
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Location</span>,
      dataIndex: ["warehouse", "location"],
      key: "location",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Quantity</span>,
      dataIndex: "unit",
      key: "unit",
      render: (text: number) => (
        <span className="font-medium text-blue-600">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">DP</span>,
      dataIndex: "dp",
      key: "dp",
      render: (text: number | undefined) => (
        <span className="text-gray-700">
          {text ? `৳${text.toFixed(2)}` : "N/A"}
        </span>
      ),
    },
    {
      title: <span className="font-medium text-base">MRP</span>,
      dataIndex: "mrp",
      key: "mrp",
      render: (text: number) => (
        <span className="text-gray-700">৳{text.toFixed(2)}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Total Value</span>,
      key: "totalValue",
      render: (
        _: unknown,
        record: { warehouse: Warehouse; unit: number; mrp: number },
      ) => (
        <span className="font-medium text-green-600">
          ৳{(record.unit * record.mrp).toFixed(2)}
        </span>
      ),
    },
  ];

  if (!product) return null;

  const stockStatus = getStockStatus(product.stock);
  const totalStock = getTotalStock(product.stock);
  const totalValue = product.stock.reduce(
    (sum, item) => sum + item.unit * item.mrp,
    0,
  );

  return (
    <Drawer
      title="Product Details"
      open={open}
      onClose={handleClose}
      width={800}
      className="rounded-3xl"
      getContainer={false}
      destroyOnHidden={true}
      closeIcon={<Icon icon="lineicons:close" className="font-extrabold" />}
      extra={
        <div className="flex gap-4 justify-end">
          <Button type="primary" onClick={handleClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Product Information */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Product Information
          </h3>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Product Name" span={2}>
              <span className="font-medium">{product.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="SKU">
              <span className="font-mono">{product.sku}</span>
            </Descriptions.Item>
            <Descriptions.Item label="UPC">
              <span className="font-mono">{product.upc}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              <span className="capitalize">
                {typeof product.category === "string"
                  ? product.category
                  : product.category?.name || ""}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Total Stock">
              <div className="flex items-center gap-2">
                <span className="font-medium">{totalStock}</span>
                <Tag color={stockStatus.color}>{stockStatus.text}</Tag>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Total Value">
              <span className="font-medium text-green-600">
                ৳{totalValue.toFixed(2)}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Stock Entries */}
        <div className="border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Stock Entries
          </h3>
          {product.stock.length > 0 ? (
            <Table
              columns={stockColumns}
              dataSource={product.stock}
              rowKey={(record, index) => `${record.warehouse._id}-${index}`}
              pagination={false}
              size="small"
              className="custom-table"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="lineicons:box" className="text-4xl mb-2" />
              <p>No stock entries found</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Stock:</span>
              <span className="font-medium ml-2">{totalStock} units</span>
            </div>
            <div>
              <span className="text-gray-600">Warehouses:</span>
              <span className="font-medium ml-2">{product.stock.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Value:</span>
              <span className="font-medium text-green-600 ml-2">
                ৳{totalValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
