"use client";

import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Spin, Alert } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined, 
  InboxOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useGetDashboardStatsQuery, useGetInventoryAlertsQuery } from '@/store/api/dashboard';
import { useGetOrdersQuery } from '@/store/api/orders';
import { useGetCustomersQuery } from '@/store/api/customers';
import { useGetProductsQuery } from '@/store/api/products';

const Dashboard: React.FC = () => {
  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useGetDashboardStatsQuery({});
  const { data: inventoryAlerts, isLoading: alertsLoading } = useGetInventoryAlertsQuery();
  
  // Fetch recent data for tables
  const { data: recentOrders } = useGetOrdersQuery({ page: 1, limit: 5 });
  const { data: customers } = useGetCustomersQuery({ page: 1, limit: 5 });
  const { data: products } = useGetProductsQuery({ page: 1, limit: 5 });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
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

  const stats = dashboardStats || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: [],
    revenueChart: []
  };

  const alerts = inventoryAlerts || {
    lowStockProducts: [],
    outOfStockProducts: [],
    expiringProducts: []
  };

  // Recent orders table columns
  const recentOrdersColumns = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors = {
          pending: 'orange',
          processing: 'blue',
          shipped: 'purple',
          delivered: 'green',
          cancelled: 'red',
        };
        return <Tag color={statusColors[status as keyof typeof statusColors]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  // Low stock products table columns
  const lowStockColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (stock: number, record: any) => (
        <span className={stock <= record.minStock ? 'text-red-500 font-semibold' : ''}>
          {stock}
        </span>
      ),
    },
    {
      title: 'Min Stock',
      dataIndex: 'minStock',
      key: 'minStock',
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              suffix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={stats.totalProducts}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts Section */}
      {(alerts.lowStockProducts.length > 0 || alerts.outOfStockProducts.length > 0) && (
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
                {alerts.lowStockProducts.length > 0 && (
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
                        rowKey="id"
                      />
                    </div>
                  </Col>
                )}
                {alerts.outOfStockProducts.length > 0 && (
                  <Col xs={24} md={12}>
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-600 mb-2">
                        Out of Stock Products ({alerts.outOfStockProducts.length})
                      </h4>
                      <Table
                        dataSource={alerts.outOfStockProducts}
                        columns={[
                          { title: 'Product', dataIndex: 'name', key: 'name' },
                          { title: 'Warehouse', dataIndex: 'warehouse', key: 'warehouse' },
                        ]}
                        pagination={false}
                        size="small"
                        rowKey="id"
                      />
                    </div>
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Orders and Top Products */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                Recent Orders
              </Space>
            }
          >
            <Table
              dataSource={stats.recentOrders}
              columns={recentOrdersColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <RiseOutlined />
                Top Products
              </Space>
            }
          >
            <Table
              dataSource={stats.topProducts}
              columns={[
                { title: 'Product', dataIndex: 'name', key: 'name' },
                { title: 'Sold', dataIndex: 'totalSold', key: 'totalSold' },
                { 
                  title: 'Revenue', 
                  dataIndex: 'revenue', 
                  key: 'revenue',
                  render: (revenue: number) => `$${revenue.toFixed(2)}`
                },
              ]}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart Placeholder */}
      {stats.revenueChart.length > 0 && (
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
      )}
    </div>
  );
};

export default Dashboard;