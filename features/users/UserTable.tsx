"use client";
import { useState, useEffect } from "react";
import { Tag } from "antd";
import { useGetUsersQuery, useDeleteUserMutation } from "./api";
import { useNotification } from "@/hooks/useNotification";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import AddEditUserDrawer from "./AddEditUserDrawer";
import type { User, UserFilters } from "./types";

const roleColors: Record<string, string> = {
  admin: "red",
  manager: "blue",
  staff: "green",
};

interface UserTableProps {
  filters?: UserFilters;
}

export default function UserTable({ filters = {} }: UserTableProps) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { success, error: showError } = useNotification();

  // API hooks
  const { data, isLoading, error, refetch } = useGetUsersQuery({
    page: current,
    limit: pageSize,
    ...filters,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Update filters when they change
  useEffect(() => {
    setCurrent(1); // Reset to first page when filters change
  }, [filters]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user._id).unwrap();
      success("User deleted successfully");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        showError("Failed to delete user", (error.data as { message: string }).message);
      } else {
        showError("Failed to delete user");
      }
    }
  };

  // Define columns using the generic interface
  const columns: TableColumn<User>[] = [
    {
      title: <span className="font-medium text-base">Name</span>,
      dataIndex: "name",
      key: "name",
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
      title: <span className="font-medium text-base">Role</span>,
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={roleColors[role]} className="capitalize">
          {role}
        </Tag>
      ),
    },
  ];

  // Define actions using the generic interface
  const actions: TableAction<User>[] = [
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
        title: "Delete User",
        description: "Are you sure you want to delete this user?",
      },
      loading: isDeleting,
    },
  ];

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <GenericTable
        data={users}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        pagination={
          pagination
            ? {
                current,
                pageSize,
                total: pagination.total,
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
                  `${range[0]}-${range[1]} of ${total} users`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }
            : undefined
        }
      />

      {/* Edit Drawer */}
      <AddEditUserDrawer
        open={!!editingUser}
        setOpen={() => setEditingUser(null)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
      />
    </>
  );
} 