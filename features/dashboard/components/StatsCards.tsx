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
            title="Total Revenue"
            value={stats.totalRevenue}
            prefix={<DollarOutlined className="text-green-500" />}
            valueStyle={{ color: "#10b981" }}
            suffix="৳"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="bg-white border rounded-2xl shadow-sm">
          <Statistic
            title="Total Orders"
            value={stats.totalOrders}
            prefix={<ShoppingCartOutlined className="text-blue-500" />}
            valueStyle={{ color: "#3b82f6" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="bg-white border rounded-2xl shadow-sm">
          <Statistic
            title="Total Customers"
            value={stats.totalCustomers}
            prefix={<UserOutlined className="text-purple-500" />}
            valueStyle={{ color: "#8b5cf6" }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card className="bg-white border rounded-2xl shadow-sm">
          <Statistic
            title="Total Products"
            value={stats.totalProducts}
            prefix={<InboxOutlined className="text-orange-500" />}
            valueStyle={{ color: "#f59e0b" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatsCards;
