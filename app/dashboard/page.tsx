"use client";

import React from "react";
import { Row, Col, Alert, Card, Statistic } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import {
  useGetDashboardStatsQuery,
  useGetInventoryAlertsQuery,
} from "@/features/dashboard";
import {
  DashboardHeader,
  DashboardSkeleton,
  InventoryAlerts,
  RecentOrders,
  TopProducts,
} from "@/features/dashboard/components";
import {
  InventoryAlerts as InventoryAlertsType,
  DashboardStats,
} from "@/features/dashboard/types";

const Dashboard: React.FC = () => {
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetDashboardStatsQuery({});
  const { data: inventoryAlerts } = useGetInventoryAlertsQuery();

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  if (statsError) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description="Failed to load dashboard data. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const stats: DashboardStats = dashboardStats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: [],
    revenueChart: [],
  };

  let alerts: InventoryAlertsType = {
    lowStockProducts: [],
    outOfStockProducts: [],
    expiringProducts: [],
  };
  if (inventoryAlerts) alerts = inventoryAlerts;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today."
      />

      {/* Statistics Cards */}
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
                <span className="text-primary font-medium">
                  Total Customers
                </span>
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

      {/* Alerts Section */}
      <InventoryAlerts alerts={alerts} />

      {/* Recent Orders and Top Products */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <RecentOrders recentOrders={stats.recentOrders} />
        </Col>
        <Col xs={24} lg={12}>
          <TopProducts topProducts={stats.topProducts} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
