"use client";

import { Card, Table, Space, Button, Tag } from "antd";
import { EyeOutlined, DownloadOutlined } from "@ant-design/icons";

interface SalesTableProps {
  salesData: any;
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onPaginationChange: (page: number, pageSize: number) => void;
  onViewSale: (saleId: string) => void;
  onDownloadInvoice: (saleId: string) => void;
}

export default function SalesTable({
  salesData,
  isLoading,
  currentPage,
  pageSize,
  onPaginationChange,
  onViewSale,
  onDownloadInvoice,
}: SalesTableProps) {
  const columns = [
    {
      title: "Sale ID",
      dataIndex: "saleId",
      key: "saleId",
      render: (saleId: string) => <Tag color="blue">{saleId}</Tag>,
    },
    {
      title: "Outlet",
      dataIndex: ["outlet", "name"],
      key: "outlet",
      render: (outletName: string) => outletName || "N/A",
    },
    {
      title: "Customer",
      dataIndex: ["customer", "name"],
      key: "customer",
      render: (customerName: string, record: any) => {
        if (customerName) {
          return (
            <div>
              <div>{customerName}</div>
              <small className="text-gray-500">{record.customer?.phone}</small>
            </div>
          );
        }
        return <Tag color="orange">Anonymous</Tag>;
      },
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: (items: any[]) => items?.length || 0,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="font-semibold text-green-600">
          ৳{amount?.toFixed(2) || '0.00'}
        </span>
      ),
    },
    {
      title: "Paid Amount",
      dataIndex: "paymentMethods",
      key: "paidAmount",
      render: (methods: any[]) => {
        const paidAmount = methods?.reduce((sum, method) => sum + (method.amount || 0), 0) || 0;
        return (
          <span className="font-medium text-blue-600">৳{paidAmount.toFixed(2)}</span>
        );
      },
    },
    {
      title: "Due Amount",
      key: "dueAmount",
      render: (record: any) => {
        const paidAmount = record.paymentMethods?.reduce((sum: number, method: any) => sum + (method.amount || 0), 0) || 0;
        const dueAmount = Math.max(0, record.totalAmount - paidAmount);
        return (
          <span className={`font-medium ${dueAmount > 0 ? 'text-red-600' : 'text-gray-500'}`}>
            ৳{dueAmount.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Payment Methods",
      dataIndex: "paymentMethods",
      key: "paymentMethods",
      render: (methods: any[]) => (
        <div className="flex flex-wrap gap-1">
          {methods?.map((method, index) => (
            <Tag key={index} color="blue" className="text-xs">
              {method.method}: ৳{method.amount?.toFixed(2)}
            </Tag>
          )) || []}
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "saleDate",
      key: "saleDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewSale(record.saleId)}
          />
          <Button
            type="default"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => onDownloadInvoice(record.saleId)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card className="shadow-md flex-1">
      <Table
        columns={columns}
        dataSource={salesData?.data || []}
        loading={isLoading}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize,
          total: (salesData as any)?.pagination?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} sales`,
          onChange: onPaginationChange,
        }}
        scroll={{ x: 1200 }}
        className="rounded-lg"
      />
    </Card>
  );
}
