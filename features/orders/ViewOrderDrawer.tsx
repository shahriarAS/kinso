"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Table, Descriptions, Divider, Tag, Statistic } from "antd";
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
        {/* Customer Info Section */}
        <div className="mb-4">
          <Descriptions
            title={<span className="font-semibold text-lg flex items-center gap-2"><Icon icon="mdi:account" /> Customer Details</span>}
            column={2}
            size="small"
            bordered
            labelStyle={{ width: 120 }}
            contentStyle={{ fontWeight: 500 }}
          >
            <Descriptions.Item label={<span className="flex items-center gap-1"><Icon icon="mdi:identifier" /> Order #</span>}>
              {order.orderNumber}
            </Descriptions.Item>
            {order.warehouse && (
              <Descriptions.Item label={<span className="flex items-center gap-1"><Icon icon="mdi:warehouse" /> Warehouse</span>}>
                {isWarehouseObj(order.warehouse) ? (order.warehouse.name || order.warehouse._id) : order.warehouse}
              </Descriptions.Item>
            )}
            {/* Get customer object if populated */}
            {(() => {
              const customerObj = typeof order.customerId === "object" && order.customerId !== null
                ? order.customerId as { name?: string; email?: string; phone?: string }
                : null;
              return [
                <Descriptions.Item label={<span className="flex items-center gap-1"><Icon icon="mdi:account" /> Name</span>} key="name">
                  {customerObj?.name || order.customerName}
                </Descriptions.Item>,
                <Descriptions.Item label={<span className="flex items-center gap-1"><Icon icon="mdi:email-outline" /> Email</span>} key="email">
                  {customerObj?.email || <span className="text-gray-400">N/A</span>}
                </Descriptions.Item>,
                <Descriptions.Item label={<span className="flex items-center gap-1"><Icon icon="mdi:phone-outline" /> Phone</span>} key="phone">
                  {customerObj?.phone || <span className="text-gray-400">N/A</span>}
                </Descriptions.Item>,
              ];
            })()}
            <Descriptions.Item label={<span className="flex items-center gap-1"><Icon icon="mdi:calendar" /> Date</span>}>
              {new Date(order.createdAt).toLocaleString()}
            </Descriptions.Item>
            {order.notes && (
              <Descriptions.Item label={<span className="flex items-center gap-1"><Icon icon="mdi:note-text-outline" /> Notes</span>}>
                {order.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>

        {/* Payments & Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payments Section */}
          <div>
            <Divider className="my-3" orientation="left">Payments</Divider>
            {order.payments && order.payments.length > 0 ? (
              <Table
                columns={[
                  {
                    title: "Method",
                    dataIndex: "method",
                    key: "method",
                    render: (method: string) => (
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:credit-card-outline" className="text-gray-400" />
                        <span className="text-gray-700">{method}</span>
                      </span>
                    ),
                  },
                  {
                    title: "Amount",
                    dataIndex: "amount",
                    key: "amount",
                    render: (amount: number) => <span className="font-semibold">৳{Number(amount).toFixed(2)}</span>,
                  },
                ]}
                dataSource={order.payments.map((p, idx) => ({ ...p, key: idx }))}
                pagination={false}
                size="small"
                bordered
                showHeader={true}
              />
            ) : (
              <span className="text-gray-400">No payments</span>
            )}
          </div>

          {/* Summary Section */}
          <div>
            <Divider className="my-3" orientation="left">Summary</Divider>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={<span className="text-gray-600">Subtotal</span>}>
                <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-red-500">Discount</span>}>
                <span className="font-semibold text-red-500">৳{discount.toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-green-700">Final Total</span>}>
                <span className="font-bold text-green-700">৳{order.totalAmount.toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-green-700">Paid</span>}>
                <span className="font-semibold">৳{order.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toFixed(2)}</span>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-red-500">Due</span>}>
                <span className={
                  Math.max(0, order.totalAmount - (order.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0)) > 0
                    ? "font-semibold text-red-500"
                    : "font-semibold text-green-700"
                }>
                  ৳{Math.max(0, order.totalAmount - (order.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0)).toFixed(2)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
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
