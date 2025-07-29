"use client";
import { Drawer, Descriptions, Tag, Button } from "antd";
import type { Demand } from "@/features/demand/types";

interface Props {
  open: boolean;
  demand: Demand | null;
  onClose: () => void;
}

export default function ViewDemandDrawer({ open, demand, onClose }: Props) {
  if (!demand) return null;

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

  return (
    <Drawer
      title="Demand Details"
      width={600}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Demand ID">
          <span className="font-mono font-medium">{demand.demand}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Product">
          <div>
            <div className="font-medium">
              {(demand.product as any)?.name || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {(demand.product as any)?.barcode || "N/A"}
            </div>
          </div>
        </Descriptions.Item>

        <Descriptions.Item label="Outlet">
          {(demand.outletId as any)?.name ? (
            <div>
              <div className="font-medium">{(demand.outletId as any).name}</div>
              <div className="text-sm text-gray-500">
                {(demand.outletId as any).outletId}
              </div>
            </div>
          ) : (
            "N/A"
          )}
        </Descriptions.Item>

        <Descriptions.Item label="Warehouse ID">
          {demand.warehouseId || "N/A"}
        </Descriptions.Item>

        <Descriptions.Item label="Quantity">
          <span className="font-medium text-lg">{demand.quantity}</span>
        </Descriptions.Item>

        <Descriptions.Item label="Demand Date">
          {new Date(demand.demandDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Descriptions.Item>

        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(demand.status)}>
            {getStatusText(demand.status)}
          </Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Created At">
          {new Date(demand.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Descriptions.Item>

        <Descriptions.Item label="Updated At">
          {new Date(demand.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
} 