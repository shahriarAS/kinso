"use client";

import React from "react";
import { Row, Col, Alert } from "antd";
import {
  useGetDashboardStatsQuery,
  useGetInventoryAlertsQuery,
} from "@/features/dashboard";
import {
  DashboardStats,
  InventoryAlerts as InventoryAlertsType,
} from "@/features/dashboard/types";

// Import the new components
import {
  DashboardHeader,
  StatsCards,
  InventoryAlerts,
  RecentOrders,
  TopProducts,
  DashboardSkeleton,
} from "@/features/dashboard/components";

const DashboardPage: React.FC = () => {
  // Fetch dashboard data
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useGetDashboardStatsQuery({});
  const {
    data: inventoryAlerts,
    isLoading: alertsLoading,
    error: alertsError,
  } = useGetInventoryAlertsQuery();

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

  const stats = dashboardStats as DashboardStats;
  const alerts = inventoryAlerts as InventoryAlertsType;

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />
      <StatsCards stats={stats} />

      {alerts && <InventoryAlerts alerts={alerts} />}

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

export default DashboardPage;
