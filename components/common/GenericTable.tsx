"use client";
import { Table, Button, Tooltip, Pagination, Popconfirm, Space } from "antd";
import { Icon } from "@iconify/react";
import React, { useState } from "react";
import type { TableProps } from "antd/es/table";
import ApiStatusHandler from "./ApiStatusHandler";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableColumn<T = any> {
  title: React.ReactNode;
  dataIndex?: string | number;
  key: string;
  width?: number;
  fixed?: "left" | "right";
  sorter?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TableAction<T = any> {
  key: string;
  label: string;
  icon: string;
  type: "view" | "edit" | "delete" | "custom";
  color: "blue" | "green" | "red" | "orange" | "purple";
  onClick?: (record: T) => void;
  confirm?: {
    title: string;
    description: string;
  };
  loading?: boolean;
  disabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface GenericTableProps<T = any> {
  // Data and loading
  data: T[];
  loading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  onRetry?: () => void;

  // Columns and actions
  columns: TableColumn<T>[];
  actions?: TableAction<T>[] | ((record: T) => TableAction<T>[]);

  // Pagination
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    pageSizeOptions?: string[];
    showTotal?: (total: number, range: [number, number]) => string;
  };

  // Table configuration
  rowKey?: string | ((record: T) => string);
  scroll?: { x?: string | number; y?: string | number };
  sticky?: boolean;
  className?: string;
  maxHeight?: number;

  // Event handlers
  onTableChange?: TableProps<T>["onChange"];
  onRow?: (record: T, index?: number) => React.HTMLAttributes<HTMLElement>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericTable<T = any>({
  data,
  loading = false,
  error,
  onRetry,
  columns,
  actions = [],
  pagination,
  rowKey = "_id",
  scroll = { x: "100%" },
  sticky = true,
  className = "min-w-[700px] !bg-white",
  maxHeight = 600,
  onTableChange,
  onRow,
}: GenericTableProps<T>) {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  const handleActionClick = async (action: TableAction<T>, record: T) => {
    if (action.onClick) {
      if (action.confirm) {
        // For actions with confirmation, the onClick should handle the confirmation
        action.onClick(record);
      } else {
        // For immediate actions, handle loading state
        setActionLoading((prev) => ({ ...prev, [action.key]: true }));
        try {
          await action.onClick(record);
        } finally {
          setActionLoading((prev) => ({ ...prev, [action.key]: false }));
        }
      }
    }
  };

  const getActionButton = (action: TableAction<T>, record: T) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700",
      green: "bg-green-50 border-green-200 hover:bg-green-100 text-green-700",
      red: "bg-red-50 border-red-200 hover:bg-red-100 text-red-600",
      orange:
        "bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700",
      purple:
        "bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700",
    };

    const button = (
      <Button
        className={`inline-flex items-center justify-center rounded-lg border transition p-1.5 ${colorClasses[action.color]}`}
        size="small"
        onClick={() => handleActionClick(action, record)}
        loading={actionLoading[action.key] || action.loading}
        disabled={action.disabled}
      >
        <Icon icon={action.icon} className="text-lg" />
      </Button>
    );

    if (action.confirm) {
      return (
        <Popconfirm
          title={action.confirm.title}
          description={action.confirm.description}
          onConfirm={() => handleActionClick(action, record)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: action.type === "delete" }}
        >
          {button}
        </Popconfirm>
      );
    }

    return button;
  };

  // Add actions column if actions are provided
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns: any[] = [...columns];
  if (actions && (Array.isArray(actions) ? actions.length > 0 : true)) {
    tableColumns.push({
      title: <span className="font-medium text-base">Action</span>,
      key: "action",
      fixed: "right" as const,
      width: Array.isArray(actions) ? actions.length * 50 + 20 : 250,
      render: (_: unknown, record: T) => {
        const recordActions = Array.isArray(actions) ? actions : actions(record);
        return (
          <Space size="small">
            {recordActions.map((action) => (
              <Tooltip key={action.key} title={action.label}>
                {getActionButton(action, record)}
              </Tooltip>
            ))}
          </Space>
        );
      },
    });
  }

  return (
    <ApiStatusHandler
      isLoading={loading}
      error={error}
      onRetry={onRetry}
      minHeight="400px"
    >
      <div
        className="bg-white border border-gray-300 rounded-3xl shadow-lg overflow-hidden flex flex-col"
        style={{ maxHeight }}
      >
        <div
          className="overflow-x-auto custom-scrollbar flex-1"
          style={{ maxHeight: maxHeight - 100 }}
        >
          <Table<T>
            columns={tableColumns}
            dataSource={data}
            rowKey={rowKey}
            className={className}
            scroll={scroll}
            pagination={false}
            sticky={sticky}
            loading={loading}
            onChange={onTableChange}
            onRow={onRow}
          />
        </div>
        {pagination && (
          <div className="custom-pagination p-4">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={pagination.onChange}
              showSizeChanger={pagination.showSizeChanger}
              showQuickJumper={pagination.showQuickJumper}
              showTotal={pagination.showTotal}
              pageSizeOptions={pagination.pageSizeOptions}
            />
          </div>
        )}
      </div>
    </ApiStatusHandler>
  );
}
