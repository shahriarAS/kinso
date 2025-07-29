"use client";

import React from "react";
import { Tag } from "antd";
import { Icon } from "@iconify/react";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import { Demand } from "./types";

interface DemandTableProps {
  demands: Demand[];
  loading: boolean;
  error?: any;
  onRefresh?: () => void;
  onEdit: (demand: Demand) => void;
  onDelete: (demand: Demand) => void;
  onView: (demand: Demand) => void;
  onConvert: (demand: Demand) => void;
  onApprove: (demand: Demand) => void;
}

export const DemandTable: React.FC<DemandTableProps> = ({
  demands,
  loading,
  error,
  onRefresh,
  onEdit,
  onDelete,
  onView,
  onConvert,
  onApprove,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "Approved":
        return "blue";
      case "ConvertedToStock":
        return "green";
      default:
        return "default";
    }
  };

  // Define columns using the generic interface
  const columns: TableColumn<Demand>[] = [
    {
      title: <span className="font-medium text-base">Location</span>,
      key: "location",
      render: (_, demand: Demand) => (
        <div className="flex items-center">
          <Icon icon="lineicons:package" className="mr-2 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {typeof demand.location === "string"
                ? demand.location
                : demand.location?.name || "N/A"}
            </div>
            <div className="text-sm text-gray-500">{demand.locationType}</div>
          </div>
        </div>
      ),
    },
    {
      title: <span className="font-medium text-base">Products</span>,
      key: "products",
      render: (_, demand: Demand) => (
        <div>
          <div className="font-medium text-gray-900">
            {demand.products.length} items
          </div>
          <div className="text-sm text-gray-500">
            Total Qty: {demand.products.reduce((sum, p) => sum + p.quantity, 0)}
          </div>
        </div>
      ),
    },
    {
      title: <span className="font-medium text-base">Status</span>,
      key: "status",
      render: (_, demand: Demand) => (
        <Tag color={getStatusColor(demand.status)}>{demand.status}</Tag>
      ),
    },
    {
      title: <span className="font-medium text-base">Created</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString();
        return <span className="text-gray-600">{formattedDate}</span>;
      },
    },
  ];

  // Define actions function that returns appropriate actions based on demand status
  const getActionsForDemand = (demand: Demand): TableAction<Demand>[] => {
    const baseActions: TableAction<Demand>[] = [
      {
        key: "view",
        label: "View Details",
        icon: "lineicons:eye",
        type: "view",
        color: "green",
        onClick: onView,
      },
    ];

    if (demand.status === "Pending") {
      baseActions.push(
        {
          key: "edit",
          label: "Edit",
          icon: "lineicons:pencil-1",
          type: "edit",
          color: "blue",
          onClick: onEdit,
        },
        {
          key: "approve",
          label: "Approve",
          icon: "ion:checkmark-sharp",
          type: "custom",
          color: "green",
          onClick: onApprove,
        },
        {
          key: "delete",
          label: "Delete",
          icon: "lineicons:trash-3",
          type: "delete",
          color: "red",
          onClick: onDelete,
          confirm: {
            title: "Delete Demand",
            description: "Are you sure you want to delete this demand?",
          },
        },
      );
    }

    if (demand.status === "Approved") {
      baseActions.push({
        key: "convert",
        label: "Convert to Stock",
        icon: "mingcute:transfer-line",
        type: "custom",
        color: "blue",
        onClick: onConvert,
      });
    }

    return baseActions;
  };

  return (
    <GenericTable
      data={demands}
      loading={loading}
      error={error}
      onRetry={onRefresh}
      columns={columns}
      actions={getActionsForDemand}
    />
  );
};
