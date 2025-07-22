"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Descriptions, Table } from "antd";
import React from "react";
import { Order } from "@/features/orders/types";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  order?: Order | null;
  onClose?: () => void;
}

export default function ViewOrderDrawer({
  open,
  setOpen,
  order,
  onClose,
}: Props) {
  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  if (!order) return null;

  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount =
    typeof order.discount === "number"
      ? order.discount
      : subtotal - order.totalAmount;

  // Add type guard for warehouse
  function isWarehouseObj(warehouse: unknown): warehouse is { _id: string; name: string } {
    return (
      typeof warehouse === "object" &&
      warehouse !== null &&
      "_id" in warehouse &&
      "name" in warehouse
    );
  }

  return (
    <Drawer
      title={order ? `Order #${order.orderNumber}` : ""}
      open={open}
      onClose={handleClose}
      width={800}
      className="rounded-3xl"
      getContainer={false}
      destroyOnClose
      closeIcon={<Icon icon="lineicons:close" className="font-extrabold" />}
      extra={
        <Button onClick={handleClose} type="default">
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="font-semibold text-lg mb-2">
            Customer: {order.customerName}
          </div>
          <div className="text-gray-600 text-sm mb-1">
            Order #: {order.orderNumber}
          </div>
          <div className="text-gray-600 text-sm mb-1">
            Date: {new Date(order.createdAt).toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm mb-1">
            Payment Method:{" "}
            <span className="font-medium text-blue-600">
              {order.paymentMethod}
            </span>
          </div>
          <div className="text-gray-600 text-sm mb-1">
            Subtotal: ৳{subtotal.toFixed(2)}
          </div>
          <div className="text-red-500 text-sm mb-1">
            Discount: ৳{discount.toFixed(2)}
          </div>
          <div className="text-green-700 text-base font-bold mb-1">
            Final Total: ৳{order.totalAmount.toFixed(2)}
          </div>
          {order.notes && (
            <div className="text-gray-600 text-sm mb-1">
              Notes: {order.notes}
            </div>
          )}
          {order.warehouse && (
            <div className="text-gray-600 text-sm mb-1">
              Warehouse: {isWarehouseObj(order.warehouse) ? (order.warehouse.name || order.warehouse._id) : order.warehouse}
            </div>
          )}
        </div>
        <div>
          <div className="font-semibold mb-2">Items</div>
          <Table
            columns={[
              {
                title: "Product",
                dataIndex: ["product", "name"],
                key: "product",
              },
              { title: "SKU", dataIndex: ["product", "sku"], key: "sku" },
              { title: "Qty", dataIndex: "quantity", key: "quantity" },
              {
                title: "Unit Price",
                dataIndex: "unitPrice",
                key: "unitPrice",
                render: (v: number) => `৳${v.toFixed(2)}`,
              },
              {
                title: "Total",
                dataIndex: "totalPrice",
                key: "totalPrice",
                render: (v: number) => `৳${v.toFixed(2)}`,
              },
            ]}
            dataSource={order.items.map((item) => ({
              ...item,
              key: item.product._id,
            }))}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      </div>
    </Drawer>
  );
}
