"use client";
import React, { useState } from "react";
import { Order } from "@/features/orders/types";
import { useGetOrdersQuery } from "@/features/orders/api";
import ViewOrderDrawer from "./ViewOrderDrawer";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import InvoicePrinter from "@/components/common/InvoicePrinter";

interface Props {
  searchTerm: string;
  paymentMethodFilter: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  warehouseFilter?: string;
  productFilter?: string;
}

export default function OrderTable({
  searchTerm,
  paymentMethodFilter,
  currentPage,
  pageSize,
  onPageChange,
  warehouseFilter,
  productFilter,
}: Props) {
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [printOrderId, setPrintOrderId] = useState<string | null>(null);

  // Prepare API params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = {
    page: currentPage,
    limit: pageSize,
  };
  if (searchTerm) params.search = searchTerm;
  if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;
  if (warehouseFilter) params.warehouse = warehouseFilter;
  if (productFilter) params.product = productFilter;

  const { data, isLoading, error, refetch } = useGetOrdersQuery(params);

  const handleView = (order: Order) => setViewOrder(order);
  const handlePrint = (order: Order) => setPrintOrderId(order._id);

  // Define columns using the generic interface
  const columns: TableColumn<Order>[] = [
    {
      title: <span className="font-medium text-base">Order #</span>,
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Customer</span>,
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Paid</span>,
      dataIndex: "paid",
      key: "paid",
      render: (_: any, record: Order) => {
        const paid =
          record.payments?.reduce(
            (sum, p) => sum + (Number(p.amount) || 0),
            0,
          ) || 0;
        return (
          <span className="font-semibold text-green-700">
            ৳{paid.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: <span className="font-medium text-base">Due</span>,
      dataIndex: "due",
      key: "due",
      render: (_: any, record: Order) => {
        const paid =
          record.payments?.reduce(
            (sum, p) => sum + (Number(p.amount) || 0),
            0,
          ) || 0;
        const due = Math.max(0, record.totalAmount - paid);
        return (
          <span className="font-semibold text-red-500">৳{due.toFixed(2)}</span>
        );
      },
    },
    {
      title: <span className="font-medium text-base">Total Amount</span>,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="font-medium text-gray-900">৳{amount.toFixed(2)}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Discount</span>,
      dataIndex: "discount",
      key: "discount",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Order) => {
        const subtotal = record.items.reduce(
          (sum, item) => sum + item.totalPrice,
          0,
        );
        const discount =
          typeof record.discount === "number"
            ? record.discount
            : subtotal - record.totalAmount;
        return <span className="text-red-500">৳{discount.toFixed(2)}</span>;
      },
    },
    {
      title: <span className="font-medium text-base">Warehouse</span>,
      dataIndex: "warehouse",
      key: "warehouse",
      render: (
        warehouse: string | { _id: string; name: string } | undefined,
      ) => (
        <span className="text-gray-700">
          {typeof warehouse === "string" ? warehouse : warehouse?.name || "N/A"}
        </span>
      ),
    },
  ];

  // Define actions using the generic interface
  const actions: TableAction<Order>[] = [
    {
      key: "view",
      label: "View Details",
      icon: "lineicons:eye",
      type: "view",
      color: "blue",
      onClick: handleView,
    },
    {
      key: "print",
      label: "Print",
      icon: "lineicons:printer",
      type: "custom",
      color: "purple",
      onClick: handlePrint,
    },
  ];

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <InvoicePrinter orderId={printOrderId || ""} open={!!printOrderId} onClose={() => setPrintOrderId(null)} />
      <GenericTable
        data={orders}
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
                  `${range[0]}-${range[1]} of ${total} orders`,
              }
            : undefined
        }
      />
      <ViewOrderDrawer
        open={!!viewOrder}
        setOpen={() => setViewOrder(null)}
        order={viewOrder}
        onClose={() => setViewOrder(null)}
      />
    </>
  );
}
