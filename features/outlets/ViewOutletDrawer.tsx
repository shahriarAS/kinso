import React from "react";
import { Drawer, Descriptions, Table, Tag, Statistic, Row, Col } from "antd";
import { Outlet } from "./types";
import { useGetOutletInventoryQuery } from "./api";

interface ViewOutletDrawerProps {
  visible: boolean;
  onClose: () => void;
  outlet: Outlet | null;
}

const ViewOutletDrawer: React.FC<ViewOutletDrawerProps> = ({
  visible,
  onClose,
  outlet,
}) => {
  const { data: inventoryData, isLoading } = useGetOutletInventoryQuery(
    outlet?._id || "",
    {
      skip: !outlet?._id,
    }
  );

  const inventoryColumns = [
    {
      title: "Product",
      dataIndex: ["product", "name"],
      key: "productName",
      render: (name: string, record: any) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">
            SKU: {record.product.sku} | UPC: {record.product.upc}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: ["product", "category"],
      key: "category",
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: any) => (
        <span className="font-medium">
          {quantity} {record.unit}
        </span>
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "dp",
      key: "dp",
      render: (dp: number) => (
        <span className="text-green-600 font-medium">
          ${dp?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      title: "MRP",
      dataIndex: "mrp",
      key: "mrp",
      render: (mrp: number) => (
        <span className="text-gray-600">
          ${mrp?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      title: "Total Value",
      key: "totalValue",
      render: (record: any) => (
        <span className="font-medium text-blue-600">
          ${((record.dp || 0) * record.quantity).toFixed(2)}
        </span>
      ),
    },
  ];

  if (!outlet) return null;

  return (
    <Drawer
      title="Outlet Details"
      width={800}
      open={visible}
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Outlet Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Outlet Information</h3>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Outlet ID">
              <Tag color="blue" className="font-mono">
                {outlet.outletId}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              <span className="font-medium">{outlet.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {new Date(outlet.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(outlet.updatedAt).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Inventory Statistics */}
        {inventoryData && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Inventory Overview</h3>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total Products"
                  value={inventoryData.data.totalProducts}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Value"
                  value={inventoryData.data.totalValue}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Low Stock Items"
                  value={inventoryData.data.products.filter(
                    (item) => item.quantity < 10
                  ).length}
                  valueStyle={{ color: "#cf1322" }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Active Items"
                  value={inventoryData.data.products.filter(
                    (item) => item.quantity > 0
                  ).length}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>
          </div>
        )}

        {/* Inventory Table */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Inventory Details</h3>
          <Table
            columns={inventoryColumns}
            dataSource={inventoryData?.data.products || []}
            loading={isLoading}
            rowKey={(record) => record.product._id}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} products`,
            }}
            className="bg-white rounded-lg shadow-sm"
          />
        </div>
      </div>
    </Drawer>
  );
};

export default ViewOutletDrawer; 