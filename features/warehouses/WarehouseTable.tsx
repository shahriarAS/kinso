"use client";

import { Table, Button, Tooltip, Pagination, Popconfirm } from "antd";
import { Icon } from "@iconify/react";
import { useState } from "react";
import {
  useGetWarehousesQuery,
  useDeleteWarehouseMutation,
} from "@/features/warehouses/api";
import type { Warehouse } from "@/features/warehouses/types";
import AddEditWarehouseDrawer from "./AddEditWarehouseDrawer";
import toast from "react-hot-toast";

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

  // API hooks
  const { data, isLoading } = useGetWarehousesQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
  });

  const [deleteWarehouse, { isLoading: isDeleting }] =
    useDeleteWarehouseMutation();

  const handleEdit = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
  };

  const handleDelete = async (_id: string) => {
    try {
      await deleteWarehouse(_id).unwrap();
      toast.success("Warehouse deleted successfully");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        toast.error((error.data as { message: string }).message);
      } else {
        toast.error("Failed to delete warehouse");
      }
    }
  };

  const columns = [
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
    {
      title: <span className="font-medium text-base">Action</span>,
      key: "action",
      render: (_: unknown, record: Warehouse) => (
        <div className="flex gap-2">
          <Tooltip title="Edit">
            <Button
              className="inline-flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition p-1.5"
              onClick={() => handleEdit(record)}
            >
              <Icon
                icon="lineicons:pencil-1"
                className="text-lg text-blue-700"
              />
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Warehouse"
              description="Are you sure you want to delete this warehouse?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                className="inline-flex items-center justify-center rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition p-1.5"
                loading={isDeleting}
              >
                <Icon
                  icon="lineicons:trash-3"
                  className="text-lg text-red-600"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  const warehouses = data?.data || [];
  const pagination = data?.pagination;

  return (
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
          dataSource={warehouses}
          rowKey="_id"
          className="min-w-[700px] !bg-white"
          scroll={{ x: "100%" }}
          pagination={false}
          loading={isLoading}
          sticky
        />
      </div>
      {pagination && (
        <div className="custom-pagination">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={pagination.total}
            onChange={onPageChange}
            showSizeChanger={false}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
          />
        </div>
      )}

      {/* Edit Drawer */}
      <AddEditWarehouseDrawer
        open={!!editingWarehouse}
        setOpen={() => setEditingWarehouse(null)}
        warehouse={editingWarehouse}
        onClose={() => setEditingWarehouse(null)}
      />
    </div>
  );
}
