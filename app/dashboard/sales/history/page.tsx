"use client";

import { useState } from "react";
import { Card, Table, Select, DatePicker, Button, Space, Typography, Tag, Input } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { salesApi } from "@/features/sales";
import { outletsApi } from "@/features/outlets";
import { customersApi } from "@/features/customers";
import type { SalesHistoryFilters } from "@/features/sales";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/constraints";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function SalesHistoryPage() {
  const [filters, setFilters] = useState<SalesHistoryFilters>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [outletFilter, setOutletFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

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
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      render: (_, record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              // TODO: Implement view sale details
              console.log("View sale:", record);
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-6 bg-secondary rounded-3xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-primary tracking-tight">Sales History</h1>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <Input
              placeholder="Search sales..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange('search', e.target.value);
              }}
              allowClear
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <Select
              placeholder="Select Payment Method"
              value={paymentMethodFilter}
              onChange={(value) => {
                setPaymentMethodFilter(value);
                handleFilterChange('paymentMethod', value);
              }}
              className="w-full"
              allowClear
            >
              {PAYMENT_METHOD_OPTIONS.map((method) => (
                <Select.Option key={method.value} value={method.value}>
                  {method.label}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Outlet</label>
            <Select
              placeholder="Select Outlet"
              value={outletFilter}
              onChange={(value) => {
                setOutletFilter(value);
                handleFilterChange('outlet', value);
              }}
              className="w-full"
              allowClear
            >
              {outletsData?.data?.map((outlet) => (
                <Select.Option key={outlet._id} value={outlet._id}>
                  {outlet.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <RangePicker
              onChange={handleDateRangeChange}
              className="w-full"
              format="YYYY-MM-DD"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-md flex-1">
        <Table
          columns={columns}
          dataSource={salesData?.data || []}
          loading={isLoading}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize,
            total: salesData?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} sales`,
            onChange: handlePaginationChange,
          }}
          scroll={{ x: 1200 }}
          className="rounded-lg"
        />
      </Card>
    </div>
  );
} 