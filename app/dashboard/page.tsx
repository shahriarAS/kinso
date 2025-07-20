"use client";

import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Space,
  Spin,
  Alert,
  Skeleton,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  useGetDashboardStatsQuery,
  useGetInventoryAlertsQuery,
} from "@/store/api/dashboard";

// Types for API responses
interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
}
interface TopProduct {
  _id: string;
  name: string;
  totalSold: number;
  revenue: number;
}
interface RevenueChartPoint {
  date: string;
  revenue: number;
  orders: number;
}
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
  revenueChart: RevenueChartPoint[];
}
interface LowStockProduct {
  _id: string;
  name: string;
  currentStock: number;
  minStock: number;
  warehouse: string;
}
interface OutOfStockProduct {
  _id: string;
  name: string;
  warehouse: string;
}
interface ExpiringProduct {
  _id: string;
  name: string;
  expiryDate: string;
  quantity: number;
}
interface InventoryAlerts {
  lowStockProducts: LowStockProduct[];
  outOfStockProducts: OutOfStockProduct[];
  expiringProducts: ExpiringProduct[];
}

const Dashboard: React.FC = () => {
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

        {/* Recent Orders and Top Products Skeleton */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined className="text-primary" />
                  <span className="text-primary font-semibold">
                    Recent Orders
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
                  <span className="text-primary font-semibold">
                    Top Products
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
        </Row>
      </div>
    );
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

  let alerts: InventoryAlerts = {
    lowStockProducts: [],
    outOfStockProducts: [],
    expiringProducts: [],
  };
  if (inventoryAlerts) alerts = inventoryAlerts;

  // Recent orders table columns
  const recentOrdersColumns = [
    {
      title: "Order #",
      dataIndex: "orderNumber",
      key: "orderNumber",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `৳${amount.toFixed(2)}`,
    },
  ];

  // Low stock products table columns
  const lowStockColumns = [
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Current Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (stock: number, record: any) => (
        <span
          className={
            stock <= record.minStock ? "text-red-500 font-semibold" : ""
          }
        >
          {stock}
        </span>
      ),
    },
    {
      title: "Min Stock",
      dataIndex: "minStock",
      key: "minStock",
    },
    {
      title: "Warehouse",
      dataIndex: "warehouse",
      key: "warehouse",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your business.
        </p>
      </div>

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
      {alertsLoading || alertsError ? (
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
              {alertsLoading && <Spin />}
              {/* {alertsError && <Alert message="Error" description="Failed to load inventory alerts." type="error" showIcon />} */}
            </Card>
          </Col>
        </Row>
      ) : (
        (alerts.lowStockProducts.length > 0 ||
          alerts.outOfStockProducts.length > 0) && (
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
                  {alerts.lowStockProducts.length > 0 ? (
                    <Col xs={24} md={12}>
                      <div className="mb-4">
                        <h4 className="font-semibold text-orange-600 mb-2">
                          Low Stock Products ({alerts.lowStockProducts.length})
                        </h4>
                        <Table
                          dataSource={alerts.lowStockProducts}
                          columns={lowStockColumns}
                          pagination={false}
                          size="small"
                          rowKey="_id"
                          locale={{ emptyText: "No low stock products" }}
                        />
                      </div>
                    </Col>
                  ) : null}
                  {alerts.outOfStockProducts.length > 0 ? (
                    <Col xs={24} md={12}>
                      <div className="mb-4">
                        <h4 className="font-semibold text-red-600 mb-2">
                          Out of Stock Products (
                          {alerts.outOfStockProducts.length})
                        </h4>
                        <Table
                          dataSource={alerts.outOfStockProducts}
                          columns={[
                            {
                              title: "Product",
                              dataIndex: "name",
                              key: "name",
                            },
                            {
                              title: "Warehouse",
                              dataIndex: "warehouse",
                              key: "warehouse",
                            },
                          ]}
                          pagination={false}
                          size="small"
                          rowKey="_id"
                          locale={{ emptyText: "No out of stock products" }}
                        />
                      </div>
                    </Col>
                  ) : null}
                </Row>
              </Card>
            </Col>
          </Row>
        )
      )}

      {/* Recent Orders and Top Products */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined className="text-primary" />
                <span className="text-primary font-semibold">
                  Recent Orders
                </span>
              </Space>
            }
            className="bg-white border rounded-2xl shadow-sm"
          >
            <Table
              dataSource={stats.recentOrders}
              columns={recentOrdersColumns}
              pagination={false}
              size="small"
              rowKey="_id"
              locale={{ emptyText: "No recent orders" }}
              className="custom-table"
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
            <Table
              dataSource={stats.topProducts}
              columns={[
                { title: "Product", dataIndex: "name", key: "name" },
                { title: "Sold", dataIndex: "totalSold", key: "totalSold" },
                {
                  title: "Revenue",
                  dataIndex: "revenue",
                  key: "revenue",
                  render: (revenue: number) => `৳${revenue.toFixed(2)}`,
                },
              ]}
              pagination={false}
              size="small"
              rowKey="_id"
              locale={{ emptyText: "No top products" }}
              className="custom-table"
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart Placeholder */}
      {/* {stats.revenueChart.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="Revenue Trend">
              <div className="h-64 flex items-center justify-center text-gray-500">
                Chart component would go here
                <br />
                Revenue data available: {stats.revenueChart.length} data points
              </div>
            </Card>
          </Col>
        </Row>
      )} */}
    </div>
  );
};

export default Dashboard;
