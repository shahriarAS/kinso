"use client";

import { Table, Button, Tooltip, Pagination, Tag } from "antd";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import type { Customer } from "@/types/customer";

const mockData: Customer[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+880 1712345678",
    address: "123 Main St",
    city: "Dhaka",
    state: "Dhaka",
    zipCode: "1200",
    country: "Bangladesh",
    registrationDate: "2024-01-01",
    totalOrders: 15,
    totalSpent: 2500.00,
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+880 1812345678",
    address: "456 Oak Ave",
    city: "Chittagong",
    state: "Chittagong",
    zipCode: "4000",
    country: "Bangladesh",
    registrationDate: "2024-01-05",
    totalOrders: 8,
    totalSpent: 1200.00,
    status: "active",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "+880 1912345678",
    address: "789 Pine Rd",
    city: "Sylhet",
    state: "Sylhet",
    zipCode: "3100",
    country: "Bangladesh",
    registrationDate: "2024-01-10",
    totalOrders: 3,
    totalSpent: 450.00,
    status: "inactive",
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    phone: "+880 1612345678",
    address: "321 Elm St",
    city: "Rajshahi",
    state: "Rajshahi",
    zipCode: "6000",
    country: "Bangladesh",
    registrationDate: "2024-01-15",
    totalOrders: 22,
    totalSpent: 3800.00,
    status: "active",
  },
  {
    id: "5",
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    phone: "+880 1512345678",
    address: "654 Maple Dr",
    city: "Khulna",
    state: "Khulna",
    zipCode: "9000",
    country: "Bangladesh",
    registrationDate: "2024-01-20",
    totalOrders: 5,
    totalSpent: 750.00,
    status: "active",
  },
];

const statusColors: Record<string, string> = {
  active: "green",
  inactive: "red",
};

export default function CustomerTable() {
  const [current, setCurrent] = useState(1);
  const pageSize = 10;
  const paginatedData = mockData.slice((current - 1) * pageSize, current * pageSize);

  const columns = [
    {
      title: <span className="font-medium text-base">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Email</span>,
      dataIndex: "email",
      key: "email",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Phone</span>,
      dataIndex: "phone",
      key: "phone",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Location</span>,
      key: "location",
      render: (_: any, record: Customer) => (
        <span className="text-gray-700">{record.city}, {record.state}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Total Orders</span>,
      dataIndex: "totalOrders",
      key: "totalOrders",
      render: (count: number) => <span className="font-medium text-gray-900">{count}</span>,
    },
    {
      title: <span className="font-medium text-base">Total Spent</span>,
      dataIndex: "totalSpent",
      key: "totalSpent",
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
      title: <span className="font-medium text-base">Action</span>,
      key: "action",
      render: (_: any, record: Customer) => (
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