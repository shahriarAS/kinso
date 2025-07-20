import React from "react";
import { Card, Row, Col, Alert, Space } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { InventoryAlerts as InventoryAlertsType } from "@/features/dashboard/types";

interface InventoryAlertsProps {
  alerts: InventoryAlertsType;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ alerts }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card
          title={
            <Space>
              <ExclamationCircleOutlined className="text-orange-500" />
              Inventory Alerts
            </Space>
          }
          className="border-orange-200"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Alert
                message={`${alerts.lowStockProducts.length} Low Stock Products`}
                description="Products with stock below minimum threshold"
                type="warning"
                showIcon
              />
            </Col>
            <Col xs={24} md={8}>
              <Alert
                message={`${alerts.outOfStockProducts.length} Out of Stock Products`}
                description="Products with zero stock"
                type="error"
                showIcon
              />
            </Col>
            <Col xs={24} md={8}>
              <Alert
                message={`${alerts.expiringProducts.length} Expiring Products`}
                description="Products nearing expiry date"
                type="info"
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
