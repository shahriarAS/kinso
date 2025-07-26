import React, { useState } from "react";
import { Table, Button, Space, Popconfirm, Tag, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Outlet } from "./types";
import { useGetOutletsQuery, useDeleteOutletMutation } from "./api";
import { useNotification } from "@/hooks/useNotification";

interface OutletTableProps {
  onEdit: (outlet: Outlet) => void;
  onView: (outlet: Outlet) => void;
  searchTerm?: string;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

const OutletTable: React.FC<OutletTableProps> = ({
  onEdit,
  onView,
  searchTerm = "",
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}) => {
  const { success, error: showError } = useNotification();
  const [deleteOutlet] = useDeleteOutletMutation();

  const { data, isLoading, error } = useGetOutletsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteOutlet(id).unwrap();
      success("Outlet deleted successfully");
    } catch (error) {
      showError("Failed to delete outlet");
    }
  };

  const columns = [
    {
      title: "Outlet ID",
      dataIndex: "outletId",
      key: "outletId",
      render: (outletId: string) => (
        <Tag color="blue" className="font-mono">
          {outletId}
        </Tag>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="font-medium text-gray-900">{name}</span>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => (
        <span className="text-gray-600">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Outlet) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Edit Outlet">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              className="text-green-600 hover:text-green-800"
            />
          </Tooltip>
          <Tooltip title="Delete Outlet">
            <Popconfirm
              title="Are you sure you want to delete this outlet?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                className="text-red-600 hover:text-red-800"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load outlets</p>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={data?.data || []}
      loading={isLoading}
      rowKey="_id"
      pagination={{
        current: currentPage,
        pageSize: pageSize,
        total: data?.pagination.total || 0,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} outlets`,
        onChange: onPageChange,
      }}
      className="bg-white rounded-lg shadow-sm"
    />
  );
};

export default OutletTable; 