"use client";

import { Table, Button, Tooltip, Pagination, Tag } from "antd";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import type { Order } from "@/types/order";

const mockData: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-001",
    customerId: "CUST-001",
    customerName: "John Doe",
    items: [],
    totalAmount: 1299.99,
    status: "pending",
    orderDate: "2024-01-15",
    paymentStatus: "pending",
    shippingAddress: "123 Main St, Dhaka, Bangladesh",
  },
  {
    id: "2",
    orderNumber: "ORD-002",
    customerId: "CUST-002",
    customerName: "Jane Smith",
    items: [],
    totalAmount: 899.99,
    status: "processing",
    orderDate: "2024-01-14",
    paymentStatus: "paid",
    shippingAddress: "456 Oak Ave, Chittagong, Bangladesh",
  },
  {
    id: "3",
    orderNumber: "ORD-003",
    customerId: "CUST-003",
    customerName: "Bob Johnson",
    items: [],
    totalAmount: 599.99,
    status: "shipped",
    orderDate: "2024-01-13",
    deliveryDate: "2024-01-20",
    paymentStatus: "paid",
    shippingAddress: "789 Pine Rd, Sylhet, Bangladesh",
  },
  {
    id: "4",
    orderNumber: "ORD-004",
    customerId: "CUST-004",
    customerName: "Alice Brown",
    items: [],
    totalAmount: 1499.99,
    status: "delivered",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-18",
    paymentStatus: "paid",
    shippingAddress: "321 Elm St, Rajshahi, Bangladesh",
  },
  {
    id: "5",
    orderNumber: "ORD-005",
    customerId: "CUST-005",
    customerName: "Charlie Wilson",
    items: [],
    totalAmount: 799.99,
    status: "cancelled",
    orderDate: "2024-01-11",
    paymentStatus: "failed",
    shippingAddress: "654 Maple Dr, Khulna, Bangladesh",
  },
];

const statusColors: Record<string, string> = {
  pending: "orange",
  processing: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
};

const paymentStatusColors: Record<string, string> = {
  pending: "orange",
  paid: "green",
  failed: "red",
};

export default function OrderTable() {
  const [current, setCurrent] = useState(1);
  const pageSize = 10;
  const paginatedData = mockData.slice((current - 1) * pageSize, current * pageSize);

  const columns = [
    {
      title: <span className="font-medium text-base">Order #</span>,
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Customer</span>,
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Total Amount</span>,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => <span className="font-medium text-gray-900">${amount.toFixed(2)}</span>,
    },
    {
      title: <span className="font-medium text-base">Status</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={statusColors[status]} className="capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: <span className="font-medium text-base">Payment</span>,
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => (
        <Tag color={paymentStatusColors[status]} className="capitalize">
          {status}
        </Tag>
      ),
    },
    {
      title: <span className="font-medium text-base">Order Date</span>,
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => <span className="text-gray-700">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: <span className="font-medium text-base">Action</span>,
      key: "action",
      render: (_: any, record: Order) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button className="inline-flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition p-1.5">
              <Icon icon="lineicons:eye" className="text-lg text-blue-700" />
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button className="inline-flex items-center justify-center rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition p-1.5">
              <Icon icon="lineicons:pencil-1" className="text-lg text-green-700" />
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Button className="inline-flex items-center justify-center rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition p-1.5">
              <Icon icon="lineicons:trash-3" className="text-lg text-red-600" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-300 rounded-3xl shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: 600 }}>
      <div
        className="overflow-x-auto custom-scrollbar flex-1"
        style={{ maxHeight: 500 }}
      >
        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="id"
          className="min-w-[700px] !bg-white"
          scroll={{ x: '100%' }}
          pagination={false}
          sticky
        />
      </div>
      <div className="custom-pagination">
        <Pagination
          current={current}
          pageSize={pageSize}
          total={mockData.length}
          onChange={setCurrent}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
} 