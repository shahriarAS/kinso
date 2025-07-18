"use client";

import { Table, Button, Tooltip, Pagination } from "antd";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import type { Product } from "@/types/product";

const mockData: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    upc: "123456789012",
    category: "electronics",
    stock: [],
  },
  {
    id: "2",
    name: "T-Shirt Black",
    upc: "987654321098",
    category: "clothing",
    stock: [],
  },
  {
    id: "3",
    name: "Organic Apple",
    upc: "555666777888",
    category: "food",
    stock: [],
  },
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    upc: "123456789012",
    category: "electronics",
    stock: [],
  },
  {
    id: "2",
    name: "T-Shirt Black",
    upc: "987654321098",
    category: "clothing",
    stock: [],
  },
  {
    id: "3",
    name: "Organic Apple",
    upc: "555666777888",
    category: "food",
    stock: [],
  },
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    upc: "123456789012",
    category: "electronics",
    stock: [],
  },
  {
    id: "2",
    name: "T-Shirt Black",
    upc: "987654321098",
    category: "clothing",
    stock: [],
  },
  {
    id: "3",
    name: "Organic Apple",
    upc: "555666777888",
    category: "food",
    stock: [],
  },
];

const categoryLabels: Record<string, string> = {
  electronics: "Electronics",
  clothing: "Clothing",
  food: "Food",
};

type Props = {};

export default function InventoryTable({}: Props) {
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
      title: <span className="font-medium text-base">UPC</span>,
      dataIndex: "upc",
      key: "upc",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Category</span>,
      dataIndex: "category",
      key: "category",
      render: (text: string) => <span className="text-gray-700 capitalize">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Action</span>,
      key: "action",
      render: (_: any, record: Product) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button className="inline-flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition p-1.5">
              <Icon icon="lineicons:pencil-1" className="text-lg text-blue-700" />
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
          className="inventory-table min-w-[700px] !bg-white"
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