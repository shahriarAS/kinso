"use client";

import { useState, useCallback } from "react";
import { Card, Table, Select, DatePicker, Button, Space, Typography, Tag, Input } from "antd";
import { SearchOutlined, ReloadOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import { salesApi } from "@/features/sales";
import { ViewSaleDrawer } from "@/features/sales/components";
import { outletsApi } from "@/features/outlets";
import { customersApi } from "@/features/customers";
import type { SalesHistoryFilters } from "@/features/sales";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/constraints";
import { pdf } from "@react-pdf/renderer";
import { useGetSettingsQuery } from "@/features/settings/api";
import { useFetchAuthUserQuery } from "@/features/auth";
import InvoicePDF from "@/components/common/InvoicePDF";
import { mapSaleToInvoiceData } from "@/lib/invoiceUtils";
import toast from "react-hot-toast";

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
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const { data: salesData, isLoading, refetch } = salesApi.useGetSalesHistoryQuery(filters);
  const { data: outletsData } = outletsApi.useGetOutletsQuery({ limit: 100 });
  const { data: customersData } = customersApi.useGetCustomersQuery({ limit: 100 });
  const { data: settingsData } = useGetSettingsQuery();
  const { data: userData } = useFetchAuthUserQuery();

  // Download invoice PDF function
  const downloadInvoicePDF = useCallback(
    async (saleId: string) => {
      if (!saleId || !settingsData) {
        toast.error("Sale ID or settings not found");
        return;
      }
      try {
        // Fetch sale data directly from API
        const response = await fetch(`/api/sales/${saleId}`);
        const saleRes = await response.json();
        if (!saleRes?.data) {
          toast.error("Sale not found");
          return;
        }
        const invoiceData = mapSaleToInvoiceData(
          saleRes.data,
          settingsData.data,
          userData?.user?.name,
        );
        const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("Invoice downloaded successfully!");
      } catch (err) {
        toast.error("Failed to download Invoice");
        console.error("Failed to download PDF", err);
      }
    },
    [settingsData, userData]
  );

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
            onClick={() => {
              setSelectedSaleId(record.saleId);
              setViewDrawerOpen(true);
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-primary">Sales History</h1>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
          size="large"
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
            total: (salesData as any)?.pagination?.total || 0,
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

      {/* View Sale Drawer */}
      <ViewSaleDrawer
        open={viewDrawerOpen}
        onClose={() => {
          setViewDrawerOpen(false);
          setSelectedSaleId(null);
        }}
        saleId={selectedSaleId}
      />
    </div>
  );
} 