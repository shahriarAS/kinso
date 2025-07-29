import React from "react";
import { Card, Table, Space, Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { DashboardStats } from "@/features/dashboard/types";

interface RecentSalesProps {
  recentSales: DashboardStats["recentSales"];
}

const RecentSales: React.FC<RecentSalesProps> = ({ recentSales }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined className="text-primary" />
          <span className="font-semibold text-primary">Recent Sales</span>
        </Space>
      }
      className="bg-white border border-gray-200 rounded-lg"
    >
      <Table
        dataSource={recentSales}
        pagination={false}
        size="small"
        rowKey="_id"
        columns={[
          {
            title: "Sale #",
            dataIndex: "saleId",
            key: "saleId",
            render: (value: string) => (
              <span className="font-mono text-sm">#{value}</span>
            ),
          },
          {
            title: "Customer",
            dataIndex: "customerName",
            key: "customerName",
            render: (value: string) => (
              <span className="font-medium">{value || 'Walk-in Customer'}</span>
            ),
          },
          {
            title: "Total",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (value: number) => (
              <span className="font-semibold text-green-600">
                ৳{value?.toFixed(2) || "0.00"}
              </span>
            ),
          },
          {
            title: "Paid",
            key: "paidAmount",
            render: (record: any) => {
              const paidAmount =
                record.paymentMethods?.reduce(
                  (sum: number, method: any) => sum + (method.amount || 0),
                  0,
                ) || 0;
              return (
                <span className="font-medium text-blue-600">
                  ৳{paidAmount.toFixed(2)}
                </span>
              );
            },
          },
          {
            title: "Due",
            key: "dueAmount",
            render: (record: any) => {
              const paidAmount =
                record.paymentMethods?.reduce(
                  (sum: number, method: any) => sum + (method.amount || 0),
                  0,
                ) || 0;
              const dueAmount = Math.max(0, record.totalAmount - paidAmount);
              return (
                <span
                  className={`font-medium ${dueAmount > 0 ? "text-red-600" : "text-gray-500"}`}
                >
                  ৳{dueAmount.toFixed(2)}
                </span>
              );
            },
          }
        ]}
      />
    </Card>
  );
};

export default RecentSales;
