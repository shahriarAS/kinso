"use client";

import { Icon } from "@iconify/react";
import { Button, Drawer, Table } from "antd";
import { useState } from "react";
import type { Customer } from "./types";
import type { Order } from "@/features/orders/types";
import { useGetOrdersByCustomerQuery } from "@/store/api/orders";
import ApiStatusHandler from "@/components/common/ApiStatusHandler";
import ViewOrderDrawer from "@/features/orders/ViewOrderDrawer";

interface Props {
  customer: Customer;
  onClose: () => void;
}

// const orderStatusColors: Record<string, string> = {
//   pending: "orange",
//   processing: "blue",
//   shipped: "purple",
//   delivered: "green",
//   cancelled: "red",
// };

// const paymentStatusColors: Record<string, string> = {
//   pending: "orange",
//   paid: "green",
//   failed: "red",
// };

export default function ViewCustomerOrdersDrawer({ customer, onClose }: Props) {
  const [open, setOpen] = useState(true);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const { data, isLoading, error, refetch } = useGetOrdersByCustomerQuery(
    customer._id,
  );

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const columns = [
    {
      title: <span className="font-medium text-base">Order #</span>,
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Date</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span className="text-gray-700">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: <span className="font-medium text-base">Items</span>,
      dataIndex: "items",
      key: "items",
      render: (items: Order["items"]) => (
        <span className="text-gray-700">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      title: <span className="font-medium text-base">Total</span>,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="font-medium text-gray-900">৳{amount.toFixed(2)}</span>
      ),
    },
    // {
    //   title: <span className="font-medium text-base">Action</span>,
    //   key: "action",
    //   render: (_: unknown, record: Order) => (
    //     <Space size="small">
    //       <Tooltip title="View Details">
    //         <Button
    //           className="inline-flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition p-1.5"
    //           size="small"
    //           onClick={() => setViewOrder(record)}
    //         >
    //           <Icon icon="lineicons:eye" className="text-lg text-blue-700" />
    //         </Button>
    //       </Tooltip>
    //     </Space>
    //   ),
    // },
  ];

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <Icon icon="lineicons:user" className="text-xl text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {customer.name}
              {"'"}s Orders
            </h3>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>
      }
      open={open}
      onClose={handleClose}
      width={800}
      className="rounded-3xl"
      getContainer={false}
      destroyOnHidden={true}
      closeIcon={<Icon icon="lineicons:close" className="font-extrabold" />}
      extra={
        <div className="flex gap-4 justify-end">
          <Button type="default" onClick={handleClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Customer Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {customer.totalOrders}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ৳{customer.totalSpent?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Order History
          </h4>
          <ApiStatusHandler
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            minHeight="300px"
          >
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm overflow-hidden">
              <Table
                columns={columns}
                dataSource={data?.data || []}
                rowKey="_id"
                className="!bg-white"
                pagination={false}
                scroll={{ x: "100%" }}
                loading={isLoading}
                locale={{
                  emptyText: (
                    <div className="py-8 text-center">
                      <Icon
                        icon="lineicons:box"
                        className="text-4xl text-gray-300 mx-auto mb-2"
                      />
                      <p className="text-gray-500">
                        No orders found for this customer
                      </p>
                    </div>
                  ),
                }}
              />
            </div>
          </ApiStatusHandler>
        </div>
      </div>
      <ViewOrderDrawer
        open={!!viewOrder}
        setOpen={() => setViewOrder(null)}
        order={viewOrder}
        onClose={() => setViewOrder(null)}
      />
    </Drawer>
  );
} 