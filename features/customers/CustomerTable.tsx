"use client";
import { useState } from "react";
import { Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
} from "@/features/customers";
import type { Customer } from "@/features/customers/types";
import AddEditCustomerDrawer from "./AddEditCustomerDrawer";
import ViewCustomerDrawer from "./ViewCustomerDrawer";
import { useNotification } from "@/hooks/useNotification";

interface Props {
  searchTerm: string;
  membershipFilter: boolean | undefined;
  statusFilter: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CustomerTable({
  searchTerm,
  membershipFilter,
  statusFilter,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const { success, error: showError } = useNotification();

  // API hooks
  const { data, isLoading, error, refetch } = useGetCustomersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    membershipStatus: membershipFilter,
  });

  const [deleteCustomer, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
  };

  const handleDelete = async (customer: Customer) => {
    try {
      await deleteCustomer(customer._id).unwrap();
      success("Customer deleted successfully");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        showError(
          "Failed to delete customer",
          (error.data as { message: string }).message,
        );
      } else {
        showError("Failed to delete customer");
      }
    }
  };

  // Define columns using the generic interface
  const columns: TableColumn<Customer>[] = [
    {
      title: <span className="text-base font-medium">Customer Name</span>,
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-gray-400" />
          <span className="font-medium text-gray-900">{name}</span>
        </div>
      ),
    },
    {
      title: <span className="text-base font-medium">Email</span>,
      key: "email",
      render: (_, record: Customer) => (
        <div className="text-sm">
          {record?.email && (
            <div className="text-gray-700">{record?.email}</div>
          )}
        </div>
      ),
    },
    // {
    //   title: <span className="text-base font-medium">Membership</span>,
    //   key: "membershipActive",
    //   render: (_, record: Customer) => (
    //     <div className="flex items-center space-x-2">
    //       <Tag color={record.membershipActive ? "green" : "default"}>
    //         {record.membershipActive ? "Active" : "Inactive"}
    //       </Tag>
    //     </div>
    //   ),
    // },
    {
      title: <span className="text-base font-medium">Total Spent</span>,
      dataIndex: "totalSpent",
      key: "totalSpent",
      render: (amount: number) => (
        <span className="font-medium text-green-600">৳{amount.toFixed(2)}</span>
      ),
    },
    {
      title: <span className="text-base font-medium">Last Month</span>,
      dataIndex: "totalPurchaseLastMonth",
      key: "totalPurchaseLastMonth",
      render: (amount: number) => (
        <span className="text-blue-600">৳{amount.toFixed(2)}</span>
      ),
    },
    {
      title: <span className="text-base font-medium">Total Sales</span>,
      dataIndex: "totalSales",
      key: "totalSales",
      render: (count: number) => (
        <span className="text-gray-600">{count} sales</span>
      ),
    },
    // {
    //   title: <span className="text-base font-medium">Created</span>,
    //   dataIndex: "createdAt",
    //   key: "createdAt",
    //   render: (date: string) => {
    //     const formattedDate = new Date(date).toLocaleDateString();
    //     return <span className="text-gray-600">{formattedDate}</span>;
    //   },
    // },
  ];

  // Define actions using the generic interface
  const actions: TableAction<Customer>[] = [
    {
      key: "view",
      label: "View Details",
      icon: "lineicons:eye",
      type: "view",
      color: "green",
      onClick: handleView,
    },
    {
      key: "edit",
      label: "Edit",
      icon: "lineicons:pencil-1",
      type: "edit",
      color: "blue",
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
        description: "Are you sure you want to delete this customer?",
      },
      loading: isDeleting,
    },
  ];

  const customers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <GenericTable
        data={customers}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        pagination={
          pagination
            ? {
                current: currentPage,
                pageSize,
                total: pagination.total,
                onChange: onPageChange,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }
            : undefined
        }
      />

      {/* Edit Drawer */}
      <AddEditCustomerDrawer
        open={!!editingCustomer}
        customer={editingCustomer}
        onClose={() => setEditingCustomer(null)}
      />

      {/* View Customer Drawer */}
      <ViewCustomerDrawer
        open={!!viewingCustomer}
        customer={viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        onEdit={(customer) => {
          setViewingCustomer(null);
          setEditingCustomer(customer);
        }}
      />
    </>
  );
}
