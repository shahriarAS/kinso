import React from "react";
import { Card, Table, Space } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { DashboardStats } from "@/features/dashboard/types";

interface RecentOrdersProps {
  recentOrders: DashboardStats["recentOrders"];
}

const RecentSales: React.FC<RecentOrdersProps> = ({ recentOrders }) => {
  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined className="text-primary" />
          <span className="text-primary font-semibold">Recent Orders</span>
        </Space>
      }
      className="bg-white border rounded-2xl shadow-sm"
    >
      <Table
        dataSource={recentOrders}
        pagination={false}
        size="small"
        columns={[
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
            render: (value: number) => `৳${value}`,
          },
        ]}
      />
    </Card>
  );
};

export default RecentSales;
