"use client";

import { useState } from "react";
import {
  useGetWarehousesQuery,
  useDeleteWarehouseMutation,
} from "@/features/warehouses/api";
import type { Warehouse } from "@/features/warehouses/types";
import AddEditWarehouseDrawer from "./AddEditWarehouseDrawer";
import { useNotification } from "@/hooks/useNotification";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";

interface Props {
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function WarehouseTable({
  searchTerm,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null,
  );
  const { success, error: showError } = useNotification();

  // API hooks
  const { data, isLoading, error, refetch } = useGetWarehousesQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
  });

  const [deleteWarehouse, { isLoading: isDeleting }] =
    useDeleteWarehouseMutation();

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
  };

  const handleDelete = async (warehouse: Warehouse) => {
    try {
      await deleteWarehouse(warehouse._id).unwrap();
      success("Warehouse deleted successfully");
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
          "Failed to delete warehouse",
          (error.data as { message: string }).message,
        );
      } else {
        showError("Failed to delete warehouse");
      }
    }
  };

  // Define columns using the generic interface
  const columns: TableColumn<Warehouse>[] = [
    {
      title: <span className="font-medium text-base">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Location</span>,
      dataIndex: "location",
      key: "location",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
  ];

  // Define actions using the generic interface
  const actions: TableAction<Warehouse>[] = [
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
        title: "Delete Warehouse",
        description: "Are you sure you want to delete this warehouse?",
      },
      loading: isDeleting,
    },
  ];

  const warehouses = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <GenericTable
        data={warehouses}
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
      <AddEditWarehouseDrawer
        open={!!editingWarehouse}
        setOpen={() => setEditingWarehouse(null)}
        warehouse={editingWarehouse}
        onClose={() => setEditingWarehouse(null)}
      />
    </>
  );
}
