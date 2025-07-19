"use client";

import { Table, Button, Tooltip, Pagination, Tag } from "antd";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import type { Order } from "@/types/order";

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