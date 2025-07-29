import React from "react";
import { Row, Col, Card, Skeleton, Space } from "antd";
import {
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton.Input
          active
          size="large"
          style={{ width: 240, height: 36, marginBottom: 8 }}
        />
        <Skeleton.Input
          active
          size="small"
          style={{ width: 320, height: 20 }}
        />
      </div>

      {/* Statistics Cards Skeleton */}
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card className="bg-white border rounded-2xl shadow-sm">
              <Skeleton active paragraph={false} title={{ width: 100 }} />
              <Skeleton.Input
                active
                size="large"
                style={{ width: 120, height: 32, marginTop: 8 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Alerts Section Skeleton */}
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
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        </Col>
      </Row>

      {/* Recent Sales and Top Products Skeleton */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined className="text-primary" />
                <span className="text-primary font-semibold">
                  Recent Sales
                </span>
              </Space>
            }
            className="bg-white border rounded-2xl shadow-sm"
          >
            <Skeleton active paragraph={false} title={false} />
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 4, width: "100%" }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined className="text-primary" />
                <span className="text-primary font-semibold">Top Products</span>
              </Space>
            }
            className="bg-white border rounded-2xl shadow-sm"
          >
            <Skeleton active paragraph={false} title={false} />
            <Skeleton
              active
              title={false}
              paragraph={{ rows: 4, width: "100%" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardSkeleton;
