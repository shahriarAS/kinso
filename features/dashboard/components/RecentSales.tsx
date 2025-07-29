import React from "react";
import { Card, Table, Space } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { DashboardStats } from "@/features/dashboard/types";

interface RecentSalesProps {
  recentSales: DashboardStats["recentSales"];
}

const RecentSales: React.FC<RecentSalesProps> = ({ recentSales }) => {
  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined className="text-primary" />
          <span className="text-primary font-semibold">Recent Sales</span>
        </Space>
      }
      className="bg-white border rounded-2xl shadow-sm"
    >
      <Table
        dataSource={recentSales}
        pagination={false}
        size="small"
        columns={[
          {
            title: "Sale #",
            dataIndex: "saleNumber",
            key: "saleNumber",
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
