"use client";
import React from "react";
import { Row, Col, Alert } from "antd";
import { useGetDashboardStatsQuery } from "@/features/dashboard";
import { DashboardHeader, DashboardSkeleton, RecentSales, StatsCards, TopProducts } from "@/features/dashboard/components";
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
  // const { data: inventoryAlerts } = useGetInventoryAlertsQuery();

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

  const stats: DashboardStats = dashboardStats?.data || {
    totalRevenue: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingSales: 0,
    lowStockProducts: 0,
    recentSales: [],
    topProducts: [],
    revenueChart: [],
  };

  // let alerts: InventoryAlertsType = {
  //   lowStockProducts: [],
  //   outOfStockProducts: [],
  //   expiringProducts: [],
  // };
  // if (inventoryAlerts) alerts = inventoryAlerts;

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today."
      />

      <StatsCards stats={stats} />

      {/* <InventoryAlerts alerts={alerts} /> */}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <RecentSales recentSales={stats.recentSales} />
        </Col>
        <Col xs={24} lg={12}>
          <TopProducts topProducts={stats.topProducts} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
