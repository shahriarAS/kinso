import React from "react";
import { Card, Row, Col, Alert, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { InventoryAlerts as InventoryAlertsType } from "@/features/dashboard/types";

interface InventoryAlertsProps {
  alerts: InventoryAlertsType;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ alerts }) => {
  const isLowStock = alerts.lowStockProducts.length > 0;
  const isOutOfStock = alerts.outOfStockProducts.length > 0;
  const isExpiring = alerts.expiringProducts.length > 0;

  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card
          title={
            <Space>
              <ExclamationCircleOutlined
                className={`text-${isLowStock || isOutOfStock || isExpiring ? "orange-500" : "green-500"}`}
              />
              Inventory Alerts
            </Space>
          }
          className={`border-${isLowStock || isOutOfStock || isExpiring ? "orange-200" : "green-200"}`}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Alert
                message={`${alerts.lowStockProducts.length} Low Stock Products`}
                description="Products with stock below minimum threshold"
                type={isLowStock ? "warning" : "success"}
                showIcon
              />
            </Col>
            <Col xs={24} md={8}>
              <Alert
                message={`${alerts.outOfStockProducts.length} Out of Stock Products`}
                description="Products with zero stock"
                type={isOutOfStock ? "error" : "success"}
                showIcon
              />
            </Col>
            <Col xs={24} md={8}>
              <Alert
                message={`${alerts.expiringProducts.length} Expiring Products`}
                description="Products nearing expiry date"
                type={isExpiring ? "info" : "success"}
                showIcon
              />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default InventoryAlerts;
