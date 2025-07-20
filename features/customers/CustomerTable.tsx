"use client";

import {
  Table,
  Button,
  Tooltip,
  Pagination,
  Tag,
  Space,
  Popconfirm,
} from "antd";
import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import type { Customer, CustomerFilters } from "./types";
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
} from "./api";
import { useNotification } from "@/hooks/useNotification";
import ApiStatusHandler from "@/components/common/ApiStatusHandler";
import AddEditCustomerDrawer from "./AddEditCustomerDrawer";
import ViewCustomerOrdersDrawer from "./ViewCustomerOrdersDrawer";

const statusColors: Record<string, string> = {
  active: "green",
  inactive: "red",
};

interface CustomerTableProps {
  filters?: CustomerFilters;
}

export default function CustomerTable({ filters = {} }: CustomerTableProps) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortFilters, setSortFilters] = useState({
    sortBy: "name",
    sortOrder: "asc" as "asc" | "desc",
  });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const { data, isLoading, error, refetch } = useGetCustomersQuery({
    page: current,
    limit: pageSize,
    ...filters,
    ...sortFilters,
  });

  const [deleteCustomer, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();
  const { success, error: showError } = useNotification();

  // Update filters when they change
  useEffect(() => {
    setCurrent(1); // Reset to first page when filters change
  }, [filters]);

  const handleDelete = async (customerId: string) => {
    try {
      await deleteCustomer(customerId).unwrap();
      success("Customer deleted successfully");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      showError(
        "Failed to delete customer",
        error?.data?.message || "An error occurred",
      );
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleViewOrders = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  const handleEditSuccess = () => {
    setEditingCustomer(null);
    refetch();
  };

  const handleViewOrdersClose = () => {
    setViewingCustomer(null);
  };

  const columns = [
    {
      title: <span className="font-medium text-base">Name</span>,
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
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
      title: <span className="font-medium text-base">Total Orders</span>,
      dataIndex: "totalOrders",
      key: "totalOrders",
      sorter: true,
      render: (count: number) => (
        <span className="font-medium text-gray-900">{count}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Total Spent</span>,
      dataIndex: "totalSpent",
      key: "totalSpent",
      sorter: true,
      render: (amount: number) => (
        <span className="font-medium text-gray-900">৳{amount.toFixed(2)}</span>
      ),
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
      fixed: "right" as const,
      width: 150,
      render: (_: unknown, record: Customer) => (
        <Space size="small">
          <Tooltip title="View Orders">
            <Button
              className="inline-flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition p-1.5"
              size="small"
              onClick={() => handleViewOrders(record)}
            >
              <Icon icon="lineicons:eye" className="text-lg text-blue-700" />
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              className="inline-flex items-center justify-center rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition p-1.5"
              size="small"
              onClick={() => handleEdit(record)}
            >
              <Icon
                icon="lineicons:pencil-1"
                className="text-lg text-green-700"
              />
            </Button>
          </Tooltip>
          <Popconfirm
            title="Delete Customer"
            description="Are you sure you want to delete this customer? This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true, loading: isDeleting }}
          >
            <Tooltip title="Delete">
              <Button
                className="inline-flex items-center justify-center rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition p-1.5"
                size="small"
                danger
              >
                <Icon
                  icon="lineicons:trash-3"
                  className="text-lg text-red-600"
                />
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (
    pagination: unknown,
    filters: unknown,
    sorter: unknown,
  ) => {
    const paginationObj = pagination as { current?: number; pageSize?: number };
    const sorterObj = sorter as { field?: string; order?: string };

    if (paginationObj.current !== current) {
      setCurrent(paginationObj.current || 1);
    }
    if (paginationObj.pageSize !== pageSize) {
      setPageSize(paginationObj.pageSize || 10);
      setCurrent(1);
    }
    if (sorterObj.field) {
      setSortFilters((prev) => ({
        ...prev,
        sortBy: sorterObj.field || "name",
        sortOrder: sorterObj.order === "descend" ? "desc" : "asc",
      }));
    }
  };

  return (
    <>
      <ApiStatusHandler
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        minHeight="400px"
      >
        <div
          className="bg-white border border-gray-300 rounded-3xl shadow-lg overflow-hidden flex flex-col"
          style={{ maxHeight: 600 }}
        >
          <div
            className="overflow-x-auto custom-scrollbar flex-1"
            style={{ maxHeight: 500 }}
          >
            <Table
              columns={columns}
              dataSource={data?.data || []}
              rowKey="_id"
              className="min-w-[700px] !bg-white"
              scroll={{ x: "100%" }}
              pagination={false}
              sticky
              onChange={handleTableChange}
              loading={isLoading}
            />
          </div>
          <div className="custom-pagination p-4">
            <Pagination
              current={current}
              pageSize={pageSize}
              total={data?.pagination?.total || 0}
              onChange={(page, size) => {
                setCurrent(page);
                if (size !== pageSize) {
                  setPageSize(size);
                  setCurrent(1);
                }
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} customers`
              }
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        </div>
      </ApiStatusHandler>

      {/* Edit Customer Drawer */}
      <AddEditCustomerDrawer
        open={!!editingCustomer}
        setOpen={() => setEditingCustomer(null)}
        customer={editingCustomer}
        onSuccess={handleEditSuccess}
      />

      {/* View Customer Orders Drawer */}
      {viewingCustomer && (
        <ViewCustomerOrdersDrawer
          customer={viewingCustomer}
          onClose={handleViewOrdersClose}
        />
      )}
    </>
  );
} 