import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { DashboardStats } from "@/features/dashboard/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="bg-white border rounded-2xl shadow-sm">
          <Statistic
            title={
              <span className="text-primary font-medium">Total Revenue</span>
            }
            value={stats.totalRevenue}
            precision={2}
            valueStyle={{ color: "#181818", fontWeight: 600, fontSize: 24 }}
            prefix={<DollarOutlined className="mr-1 text-lg align-middle" />}
            suffix={<span className="text-base font-semibold">৳</span>}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="bg-white border rounded-2xl shadow-sm">
          <Statistic
            title={
              <span className="text-primary font-medium">Total Orders</span>
            }
            value={stats.totalOrders}
            valueStyle={{ color: "#181818", fontWeight: 600, fontSize: 24 }}
            prefix={
              <ShoppingCartOutlined className="mr-1 text-lg align-middle" />
            }
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="bg-white border rounded-2xl shadow-sm">
          <Statistic
            title={
              <span className="text-primary font-medium">Total Customers</span>
            }
            value={stats.totalCustomers}
            valueStyle={{ color: "#181818", fontWeight: 600, fontSize: 24 }}
            prefix={<UserOutlined className="mr-1 text-lg align-middle" />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="bg-white border rounded-2xl shadow-sm">
          <Statistic
            title={
              <span className="text-primary font-medium">Total Products</span>
            }
            value={stats.totalProducts}
            valueStyle={{ color: "#181818", fontWeight: 600, fontSize: 24 }}
            prefix={<InboxOutlined className="mr-1 text-lg align-middle" />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatsCards;
