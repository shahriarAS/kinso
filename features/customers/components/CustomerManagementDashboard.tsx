"use client";
import React, { useState } from "react";
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Modal, Typography } from "antd";
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, TrophyOutlined } from "@ant-design/icons";
import { useGetCustomersQuery } from "@/features/customers";
import { salesApi } from "@/features/sales";
import type { Customer } from "@/features/customers/types";

const { Title, Text } = Typography;

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCustomers: Array<{
    customer: Customer;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: string;
  }>;
  customerSegments: {
    new: number;
    regular: number;
    premium: number;
    inactive: number;
  };
}

export default function CustomerManagementDashboard() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetailsVisible, setCustomerDetailsVisible] = useState(false);

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useGetCustomersQuery({
    limit: 1000,
  });

  // Fetch sales data for customer analysis
  const { data: salesData } = salesApi.useGetSalesHistoryQuery({
    limit: 1000,
  });

  // Calculate customer statistics
  const calculateCustomerStats = (): CustomerStats => {
    if (!customersData?.data || !salesData?.data) {
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topCustomers: [],
        customerSegments: { new: 0, regular: 0, premium: 0, inactive: 0 },
      };
    }

    const customers = customersData.data;
    const sales = salesData.data;

    // Group sales by customer
    const customerSales: Record<string, {
      totalSpent: number;
      orderCount: number;
      lastOrderDate: string;
      orders: any[];
    }> = {};

    sales.forEach(sale => {
      if (sale.customerId) {
        const customerId = typeof sale.customerId === 'string' ? sale.customerId : sale.customerId._id;
        if (!customerSales[customerId]) {
          customerSales[customerId] = {
            totalSpent: 0,
            orderCount: 0,
            lastOrderDate: '',
            orders: [],
          };
        }
        customerSales[customerId].totalSpent += sale.totalAmount;
        customerSales[customerId].orderCount += 1;
        customerSales[customerId].orders.push(sale);
        
        if (sale.createdAt > customerSales[customerId].lastOrderDate) {
          customerSales[customerId].lastOrderDate = sale.createdAt;
        }
      }
    });

    // Calculate total revenue
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Find top customers
    const topCustomers = Object.entries(customerSales)
      .map(([customerId, salesData]) => {
        const customer = customers.find(c => c._id === customerId);
        return {
          customer,
          totalSpent: salesData.totalSpent,
          orderCount: salesData.orderCount,
          lastOrderDate: salesData.lastOrderDate,
        };
      })
      .filter((item): item is { customer: Customer; totalSpent: number; orderCount: number; lastOrderDate: string } => 
        item.customer !== undefined
      )
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Calculate customer segments
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const customerSegments = {
      new: 0,
      regular: 0,
      premium: 0,
      inactive: 0,
    };

    customers.forEach(customer => {
      const salesData = customerSales[customer._id];
      if (!salesData) {
        customerSegments.new++;
        return;
      }

      const lastOrderDate = new Date(salesData.lastOrderDate);
      const isActive = lastOrderDate > thirtyDaysAgo;
      const isPremium = salesData.totalSpent > 10000; // Premium threshold
      const isRegular = salesData.orderCount > 5; // Regular customer threshold

      if (!isActive) {
        customerSegments.inactive++;
      } else if (isPremium) {
        customerSegments.premium++;
      } else if (isRegular) {
        customerSegments.regular++;
      } else {
        customerSegments.new++;
      }
    });

    const activeCustomers = customers.filter(customer => {
      const salesData = customerSales[customer._id];
      if (!salesData) return false;
      const lastOrderDate = new Date(salesData.lastOrderDate);
      return lastOrderDate > thirtyDaysAgo;
    }).length;

    return {
      totalCustomers: customers.length,
      activeCustomers,
      totalRevenue,
      averageOrderValue: totalRevenue / sales.length || 0,
      topCustomers,
      customerSegments,
    };
  };

  const stats = calculateCustomerStats();

  const topCustomersColumns = [
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
             render: (customer: Customer) => (
         <div>
           <div className="font-medium">{customer.name}</div>
           <div className="text-sm text-gray-500">{customer.contactInfo.phone}</div>
         </div>
       ),
    },
    {
      title: "Total Spent",
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (amount: number) => (
        <span className="font-semibold text-green-600">
          ৳{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orderCount",
      key: "orderCount",
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Last Order",
      dataIndex: "lastOrderDate",
      key: "lastOrderDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedCustomer(record.customer);
            setCustomerDetailsVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const customerSegmentsData = [
    { type: "New Customers", count: stats.customerSegments.new, color: "#1890ff" },
    { type: "Regular Customers", count: stats.customerSegments.regular, color: "#52c41a" },
    { type: "Premium Customers", count: stats.customerSegments.premium, color: "#faad14" },
    { type: "Inactive Customers", count: stats.customerSegments.inactive, color: "#ff4d4f" },
  ];

  return (
    <div className="space-y-6">
      <Title level={2}>Customer Management Dashboard</Title>

      {/* Statistics Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              loading={customersLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Customers"
              value={stats.activeCustomers}
              prefix={<ShoppingCartOutlined />}
              loading={customersLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              loading={customersLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Order Value"
              value={stats.averageOrderValue}
              prefix={<TrophyOutlined />}
              precision={2}
              loading={customersLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Customer Segments */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Customer Segments" className="h-full">
            <div className="space-y-4">
              {customerSegmentsData.map((segment) => (
                <div key={segment.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <Text>{segment.type}</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Text strong>{segment.count}</Text>
                    <Progress
                      percent={Math.round((segment.count / stats.totalCustomers) * 100)}
                      showInfo={false}
                      strokeColor={segment.color}
                      size="small"
                      style={{ width: 100 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Customer Activity" className="h-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}%
              </div>
              <Text type="secondary">Active Customer Rate</Text>
              <div className="mt-4">
                <Progress
                  type="circle"
                  percent={Math.round((stats.activeCustomers / stats.totalCustomers) * 100)}
                  format={(percent) => `${percent}%`}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top Customers Table */}
      <Card title="Top Customers by Revenue">
        <Table
          columns={topCustomersColumns}
          dataSource={stats.topCustomers}
          rowKey={(record) => record.customer._id}
          pagination={false}
          loading={customersLoading}
        />
      </Card>

      {/* Customer Details Modal */}
      <Modal
        title="Customer Details"
        open={customerDetailsVisible}
        onCancel={() => setCustomerDetailsVisible(false)}
        footer={null}
        width={800}
      >
        {selectedCustomer && (
          <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
               <div>
                 <Text strong>Name:</Text>
                 <div>{selectedCustomer.name}</div>
               </div>
               <div>
                 <Text strong>Phone:</Text>
                 <div>{selectedCustomer.contactInfo.phone}</div>
               </div>
               <div>
                 <Text strong>Email:</Text>
                 <div>{selectedCustomer.contactInfo.email}</div>
               </div>
               <div>
                 <Text strong>Address:</Text>
                 <div>{selectedCustomer.contactInfo.address}</div>
               </div>
             </div>
            
            {/* Purchase History */}
            <div>
              <Text strong>Purchase History</Text>
              <div className="mt-2">
                {salesData?.data
                  .filter(sale => 
                    typeof sale.customerId === 'string' 
                      ? sale.customerId === selectedCustomer._id
                      : sale.customerId?._id === selectedCustomer._id
                  )
                  .map(sale => (
                    <div key={sale._id} className="border-b py-2">
                      <div className="flex justify-between">
                        <span>{sale.saleId}</span>
                        <span className="font-semibold">৳{sale.totalAmount}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 