"use client";

import React from "react";
import {
  Drawer,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Divider,
  Alert,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Demand } from "./types";

interface ViewDemandDrawerProps {
  demand: Demand | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (demand: Demand) => void;
  onApprove?: (id: string) => void;
  onConvert?: (demand: Demand) => void;
}

export const ViewDemandDrawer: React.FC<ViewDemandDrawerProps> = ({
  demand,
  open,
  onClose,
  onEdit,
  onApprove,
  onConvert,
}) => {
  if (!demand) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "Approved":
        return "blue";
      case "ConvertedToStock":
        return "green";
      default:
        return "default";
    }
  };

  const productColumns = [
    {
      title: "Product Name",
      dataIndex: ["product", "name"],
      key: "productName",
      render: (name: string) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Barcode",
      dataIndex: ["product", "barcode"],
      key: "barcode",
    },
    {
      title: "Category",
      dataIndex: ["product", "category", "name"],
      key: "category",
    },
    {
      title: "Brand",
      dataIndex: ["product", "brand", "name"],
      key: "brand",
    },
    {
      title: "Vendor",
      dataIndex: ["product", "vendor", "name"],
      key: "vendor",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => (
        <span className="font-medium text-blue-600">{quantity}</span>
      ),
    },
  ];

  const totalQuantity = demand.products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Demand Details</span>
          <Space>
            {demand.status === "Pending" && onEdit && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onEdit(demand)}
                size="small"
              >
                Edit
              </Button>
            )}
            {demand.status === "Pending" && onApprove && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => onApprove(demand._id)}
                size="small"
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            )}
            {demand.status === "Approved" && onConvert && (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={() => onConvert(demand)}
                size="small"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Convert to Stock
              </Button>
            )}
          </Space>
        </div>
      }
      width={800}
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined />}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium mb-4">Basic Information</h3>
          {demand.status === "ConvertedToStock" && (
            <Alert
              message="Converted to Stock"
              description="This demand has been converted to stock. Only the products that were actually converted are shown below."
              type="success"
              showIcon
              className="mb-4"
            />
          )}
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Location" span={1}>
              <span className="font-medium">
                {typeof demand.location === "string"
                  ? demand.location
                  : demand.location?.name || "N/A"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Location Type" span={1}>
              <Tag color="blue">{demand.locationType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={1}>
              <Tag color={getStatusColor(demand.status)}>{demand.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Items" span={1}>
              <span className="font-medium text-blue-600">
                {demand.products.length}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Total Quantity" span={1}>
              <span className="font-medium text-green-600">
                {totalQuantity}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Created At" span={1}>
              {new Date(demand.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At" span={2}>
              {new Date(demand.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        {/* Products Table */}
        <div>
          <h3 className="text-lg font-medium mb-4">Products</h3>
          <Table
            dataSource={demand.products}
            columns={productColumns}
            pagination={false}
            size="middle"
            rowKey={(record) => record.product._id}
            bordered
            summary={(pageData) => {
              const total = pageData.reduce(
                (sum, record) => sum + record.quantity,
                0,
              );
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong className="text-blue-600">{total}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      </div>
    </Drawer>
  );
};
