"use client";

import React, { useState } from "react";
import { Card, Table, Select, DatePicker, Button, Space, Typography, Tag } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { salesApi } from "@/features/sales";
import { outletsApi } from "@/features/outlets";
import { customersApi } from "@/features/customers";
import type { SalesHistoryFilters } from "@/features/sales";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function SalesHistoryPage() {
  const [filters, setFilters] = useState<SalesHistoryFilters>({
    page: 1,
    limit: 10,
  });

  const { data: salesData, isLoading, refetch } = salesApi.useGetSalesHistoryQuery(filters);
  const { data: outletsData } = outletsApi.useGetOutletsQuery({ limit: 100 });
  const { data: customersData } = customersApi.useGetCustomersQuery({ limit: 100 });

  const handleFilterChange = (key: keyof SalesHistoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
        page: 1,
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
        page: 1,
      }));
    }
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  };

  const columns = [
    {
      title: "Sale ID",
      dataIndex: "saleId",
      key: "saleId",
      render: (saleId: string) => <Tag color="blue">{saleId}</Tag>,
    },
    {
      title: "Outlet",
      dataIndex: ["outletId", "name"],
      key: "outlet",
      render: (outletName: string) => outletName || "N/A",
    },
    {
      title: "Customer",
      dataIndex: ["customerId", "name"],
      key: "customer",
      render: (customerName: string, record: any) => {
        if (customerName) {
          return (
            <div>
              <div>{customerName}</div>
              <small className="text-gray-500">{record.customerId?.phone}</small>
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
      render: (items: any[]) => items.length,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="font-semibold text-green-600">
          ৳{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => {
        const methodColors: Record<string, string> = {
          CASH: "green",
          BKASH: "blue",
          ROCKET: "purple",
          NAGAD: "orange",
          BANK: "cyan",
          CARD: "magenta",
        };
        return <Tag color={methodColors[method] || "default"}>{method}</Tag>;
      },
    },
    {
      title: "Sale Date",
      dataIndex: "saleDate",
      key: "saleDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Created By",
      dataIndex: ["createdBy", "name"],
      key: "createdBy",
      render: (name: string) => name || "N/A",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>Sales History</Title>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Outlet</label>
            <Select
              placeholder="Select outlet"
              allowClear
              className="w-full"
              value={filters.outletId}
              onChange={(value) => handleFilterChange("outletId", value)}
            >
              {outletsData?.data.map((outlet: any) => (
                <Option key={outlet._id} value={outlet._id}>
                  {outlet.name}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Customer</label>
            <Select
              placeholder="Select customer"
              allowClear
              showSearch
              optionFilterProp="children"
              className="w-full"
              value={filters.customerId}
              onChange={(value) => handleFilterChange("customerId", value)}
            >
              {customersData?.data.map((customer: any) => (
                <Option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.phone}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Date Range</label>
            <RangePicker
              className="w-full"
              onChange={handleDateRangeChange}
            />
          </div>

          <div className="flex items-end">
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => refetch()}
              >
                Search
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setFilters({ page: 1, limit: 10 });
                }}
              >
                Reset
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      {/* Sales Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={salesData?.data || []}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: salesData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} sales`,
            onChange: handlePaginationChange,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
} 