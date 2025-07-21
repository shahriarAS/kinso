"use client";

import React, { useState, useEffect } from "react";
import { Tag } from "antd";
import type { Customer, CustomerFilters } from "./types";
import { useGetCustomersQuery, useDeleteCustomerMutation } from "./api";
import { useNotification } from "@/hooks/useNotification";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
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

  const handleDelete = async (customer: Customer) => {
    try {
      await deleteCustomer(customer._id).unwrap();
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

  // Define columns using the generic interface
  const columns: TableColumn<Customer>[] = [
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
  ];

  // Define actions using the generic interface
  const actions: TableAction<Customer>[] = [
    {
      key: "view-orders",
      label: "View Orders",
      icon: "lineicons:eye",
      type: "view",
      color: "blue",
      onClick: handleViewOrders,
    },
    {
      key: "edit",
      label: "Edit",
      icon: "lineicons:pencil-1",
      type: "edit",
      color: "green",
      onClick: handleEdit,
    },
    {
      key: "delete",
      label: "Delete",
      icon: "lineicons:trash-3",
      type: "delete",
      color: "red",
      onClick: handleDelete,
      confirm: {
        title: "Delete Customer",
        description: "Are you sure you want to delete this customer? This action cannot be undone.",
      },
      loading: isDeleting,
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
      <GenericTable
        data={data?.data || []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        pagination={{
          current,
          pageSize,
          total: data?.pagination?.total || 0,
          onChange: (page, size) => {
            setCurrent(page);
            if (size && size !== pageSize) {
              setPageSize(size);
              setCurrent(1);
            }
          },
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} customers`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        onTableChange={handleTableChange}
      />

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
