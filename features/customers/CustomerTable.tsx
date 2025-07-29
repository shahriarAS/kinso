"use client";

import React, { useState, useEffect } from "react";
import { Tag, Switch } from "antd";
import type { Customer, CustomerFilters } from "./types";
import { useGetCustomersQuery, useDeleteCustomerMutation, useUpdateMembershipMutation } from "./api";
import { useNotification } from "@/hooks/useNotification";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import AddEditCustomerDrawer from "./AddEditCustomerDrawer";

interface CustomerTableProps {
  filters?: CustomerFilters;
}

export default function CustomerTable({ filters = {} }: CustomerTableProps) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortFilters, setSortFilters] = useState({
    sortBy: "customerName",
    sortOrder: "asc" as "asc" | "desc",
  });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data, isLoading, error, refetch } = useGetCustomersQuery({
    page: current,
    limit: pageSize,
    ...filters,
    ...sortFilters,
  });

  const [deleteCustomer, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();
  const [updateMembership] = useUpdateMembershipMutation();
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

  const handleMembershipToggle = async (customer: Customer, checked: boolean) => {
    try {
      await updateMembership({ _id: customer._id, membershipStatus: checked }).unwrap();
      success(`Membership ${checked ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error: any) {
      showError("Failed to update membership status", error?.data?.message || "An error occurred");
    }
  };

  const handleEditSuccess = () => {
    setEditingCustomer(null);
    refetch();
  };

  // Define columns using the generic interface
  const columns: TableColumn<Customer>[] = [
    {
      title: <span className="font-medium text-base">Customer ID</span>,
      dataIndex: "customerId",
      key: "customerId",
      sorter: true,
      render: (text: string) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{text}</code>
      ),
    },
    {
      title: <span className="font-medium text-base">Name</span>,
      dataIndex: "customerName",
      key: "customerName",
      sorter: true,
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Contact Info</span>,
      dataIndex: "contactInfo",
      key: "contactInfo",
      render: (text: string) => (
        <span className="text-gray-700 max-w-xs truncate block" title={text}>
          {text}
        </span>
      ),
    },
    {
      title: <span className="font-medium text-base">Purchase Amount</span>,
      dataIndex: "purchaseAmount",
      key: "purchaseAmount",
      sorter: true,
      render: (amount: number) => (
        <span className="font-medium text-green-600">${amount.toFixed(2)}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Membership</span>,
      dataIndex: "membershipStatus",
      key: "membershipStatus",
      render: (isMember: boolean, record: Customer) => (
        <Switch
          checked={isMember}
          onChange={(checked) => handleMembershipToggle(record, checked)}
          checkedChildren="Member"
          unCheckedChildren="Non-Member"
          size="small"
        />
      ),
    },
  ];

  // Define actions using the generic interface
  const actions: TableAction<Customer>[] = [
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
        description:
          "Are you sure you want to delete this customer? This action cannot be undone.",
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
        sortBy: sorterObj.field || "customerName",
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
    </>
  );
}
