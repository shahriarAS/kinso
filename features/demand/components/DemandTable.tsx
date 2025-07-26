"use client";
import { useState } from "react";
import { Tag, Button, Space, Modal } from "antd";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import {
  useGetDemandsQuery,
  useDeleteDemandMutation,
  useUpdateDemandStatusMutation,
  useConvertDemandToStockMutation,
} from "@/features/demand/api";
import type { Demand } from "@/features/demand/types";
import { useNotification } from "@/hooks/useNotification";
import AddEditDemandDrawer from "./AddEditDemandDrawer";
import ViewDemandDrawer from "./ViewDemandDrawer";
import ConvertDemandModal from "./ConvertDemandModal";

interface Props {
  searchTerm: string;
  outletFilter: string;
  warehouseFilter: string;
  statusFilter: string;
  startDate: string;
  endDate: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function DemandTable({
  searchTerm,
  outletFilter,
  warehouseFilter,
  statusFilter,
  startDate,
  endDate,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [editingDemand, setEditingDemand] = useState<Demand | null>(null);
  const [viewingDemand, setViewingDemand] = useState<Demand | null>(null);
  const [convertingDemand, setConvertingDemand] = useState<Demand | null>(null);
  const { success, error: showError } = useNotification();

  // API hooks
  const { data, isLoading, error, refetch } = useGetDemandsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    outletId: outletFilter || undefined,
    warehouseId: warehouseFilter || undefined,
    status: statusFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sortBy: "demandDate",
    sortOrder: "desc",
  });

  const [deleteDemand, { isLoading: isDeleting }] = useDeleteDemandMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateDemandStatusMutation();
  const [convertDemand, { isLoading: isConverting }] = useConvertDemandToStockMutation();

  const handleEdit = (demand: Demand) => {
    setEditingDemand(demand);
  };

  const handleView = (demand: Demand) => {
    setViewingDemand(demand);
  };

  const handleDelete = async (demand: Demand) => {
    Modal.confirm({
      title: "Delete Demand",
      content: `Are you sure you want to delete demand ${demand.demandId}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteDemand(demand._id).unwrap();
          success("Demand deleted successfully");
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
              "Failed to delete demand",
              (error.data as { message: string }).message,
            );
          } else {
            showError("Failed to delete demand");
          }
        }
      },
    });
  };

  const handleStatusUpdate = async (demand: Demand, newStatus: string) => {
    try {
      await updateStatus({ _id: demand._id, status: newStatus as any }).unwrap();
      success(`Demand status updated to ${newStatus}`);
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
          "Failed to update demand status",
          (error.data as { message: string }).message,
        );
      } else {
        showError("Failed to update demand status");
      }
    }
  };

  const handleConvert = (demand: Demand) => {
    setConvertingDemand(demand);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "blue";
      case "converted":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Define columns using the generic interface
  const columns: TableColumn<Demand>[] = [
    {
      title: "Demand ID",
      dataIndex: "demandId",
      key: "demandId",
      width: 150,
    },
    {
      title: "Product",
      dataIndex: "productId",
      key: "productId",
      width: 200,
      render: (productId: any) => (
        <div>
          <div className="font-medium">{productId?.name}</div>
          <div className="text-sm text-gray-500">{productId?.barcode}</div>
        </div>
      ),
    },
    {
      title: "Outlet",
      dataIndex: "outletId",
      key: "outletId",
      width: 150,
      render: (outletId: any) => outletId?.name || "N/A",
    },
    {
      title: "Warehouse",
      dataIndex: "warehouseId",
      key: "warehouseId",
      width: 120,
      render: (warehouseId: string) => warehouseId || "N/A",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      render: (quantity: number) => (
        <span className="font-medium">{quantity}</span>
      ),
    },
    {
      title: "Demand Date",
      dataIndex: "demandDate",
      key: "demandDate",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record: Demand) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleView(record)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {record.status === "pending" && (
            <Button
              type="link"
              size="small"
              onClick={() => handleStatusUpdate(record, "approved")}
              loading={isUpdatingStatus}
            >
              Approve
            </Button>
          )}
          {(record.status === "pending" || record.status === "approved") && (
            <Button
              type="link"
              size="small"
              onClick={() => handleConvert(record)}
            >
              Convert
            </Button>
          )}
          <Button
            type="link"
            size="small"
            danger
            onClick={() => handleDelete(record)}
            loading={isDeleting}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const actions: TableAction[] = [
    {
      key: "refresh",
      label: "Refresh",
      icon: "mdi:refresh",
      type: "custom",
      color: "blue",
      onClick: () => refetch(),
    },
  ];

  return (
    <>
      <GenericTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.total || 0,
          onChange: onPageChange,
          showSizeChanger: false,
        }}
        actions={actions}
        rowKey="_id"
      />

      {/* Drawers and Modals */}
      {editingDemand && (
        <AddEditDemandDrawer
          open={!!editingDemand}
          demand={editingDemand}
          onClose={() => setEditingDemand(null)}
        />
      )}

      {viewingDemand && (
        <ViewDemandDrawer
          open={!!viewingDemand}
          demand={viewingDemand}
          onClose={() => setViewingDemand(null)}
        />
      )}

      {convertingDemand && (
        <ConvertDemandModal
          open={!!convertingDemand}
          demand={convertingDemand}
          onClose={() => setConvertingDemand(null)}
          onSuccess={() => {
            setConvertingDemand(null);
            refetch();
          }}
        />
      )}
    </>
  );
} 