"use client";

import { Table, Button, Tooltip, Pagination, Drawer, Spin } from "antd";
import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import type { Order } from "@/types/order";
import { useGetOrdersQuery } from "@/store/api/orders";
import InvoiceTemplate, { InvoiceData } from "../pos/InvoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OrderTableProps {
  filters?: {
    search?: string;
    dateRange?: [string, string];
  };
}

function mapOrderToInvoiceData(order: Order): InvoiceData {
  // Support both string and populated object for customerId
  const customerObj = typeof order.customerId === "object" && order.customerId !== null
    ? order.customerId as { _id: string; name: string; email?: string; phone?: string }
    : null;

  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = subtotal - order.totalAmount;

  return {
    invoiceNumber: order.orderNumber,
    date: new Date(order.createdAt).toLocaleDateString(),
    customerId: customerObj ? customerObj._id : (order.customerId as string),
    customer: {
      name: customerObj ? customerObj.name : order.customerName,
      location: "",
      id: customerObj ? customerObj._id : (order.customerId as string),
      email: customerObj ? customerObj.email : undefined,
      phone: customerObj ? customerObj.phone : undefined,
    },
    company: {
      name: "EZ POS",
      location: "Your City, Country",
      address: "123 Main St, Suite 100",
      phone: "+1-555-123-4567",
      email: "info@ezpos.com",
      website: "www.ezpos.com",
      logo: "EZ",
    },
    items: order.items.map((item) => ({
      description: item.product.name,
      details: `SKU: ${item.product.sku}; UPC: ${item.product.upc}`,
      quantity: item.quantity,
      rate: item.unitPrice,
      price: item.totalPrice,
    })),
    subtotal,
    discount,
    total: order.totalAmount,
    signatory: {
      name: "EZ POS",
      title: "Cashier",
    },
  };
}

export default function OrderTable({ filters = {} }: OrderTableProps) {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [printInvoiceData, setPrintInvoiceData] = useState<InvoiceData | null>(null);

  const printContainerRef = React.useRef<HTMLDivElement>(null);

  // Prepare API params
  const params: any = {
    page: current,
    limit: pageSize,
  };
  if (filters.search) params.search = filters.search;
  if (filters.dateRange && filters.dateRange.length === 2) {
    params.startDate = filters.dateRange[0];
    params.endDate = filters.dateRange[1];
  }

  const { data, isLoading, error, refetch } = useGetOrdersQuery(params);

  const handleView = (order: Order) => setViewOrder(order);
  const handlePrint = (order: Order) => {
    setPrintInvoiceData(mapOrderToInvoiceData(order));
    setPrintOrder(order);
  };

  useEffect(() => {
    if (printOrder && printInvoiceData && printContainerRef.current) {
      // Wait for the InvoiceTemplate to render
      setTimeout(async () => {
        const input = printContainerRef.current;
        if (!input) return;
        // Use html2canvas to capture the invoice
        const canvas = await html2canvas(input, { scale: 2, useCORS: false, backgroundColor: '#fff' });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        // Calculate width/height for A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        // Scale image to fit width
        const imgProps = canvas;
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.autoPrint();
        // Open PDF in new window and trigger print
        const pdfBlob = pdf.output("bloburl");
        const printWindow = window.open(pdfBlob);
        setPrintOrder(null);
        setPrintInvoiceData(null);
      }, 100); // Wait for DOM update
    }
  }, [printOrder, printInvoiceData]);

  const columns = [
    {
      title: <span className="font-medium text-base">Order #</span>,
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Customer</span>,
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string) => <span className="text-gray-700">{text}</span>,
    },
    {
      title: <span className="font-medium text-base">Total Amount</span>,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => <span className="font-medium text-gray-900">৳{amount.toFixed(2)}</span>,
    },
    {
      title: <span className="font-medium text-base">Discount</span>,
      dataIndex: "discount",
      key: "discount",
      render: (_: any, record: Order) => {
        const subtotal = record.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const discount = typeof record.discount === 'number' ? record.discount : subtotal - record.totalAmount;
        return <span className="text-red-500">৳{discount.toFixed(2)}</span>;
      },
    },
    {
      title: <span className="font-medium text-base">Final Total</span>,
      dataIndex: "totalAmount",
      key: "finalTotal",
      render: (amount: number, record: Order) => {
        return <span className="font-bold text-green-700">৳{amount.toFixed(2)}</span>;
      },
    },
    {
      title: <span className="font-medium text-base">Action</span>,
      key: "action",
      render: (_: any, record: Order) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button className="inline-flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition p-1.5" onClick={() => handleView(record)}>
              <Icon icon="lineicons:eye" className="text-lg text-blue-700" />
            </Button>
          </Tooltip>
          <Tooltip title="Print">
            <Button className="inline-flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition p-1.5" onClick={() => handlePrint(record)}>
              <Icon icon="lineicons:printer" className="text-lg text-gray-700" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1, width: 794, height: 1123, background: "white" }}>
        {/* Hidden print container for PDF generation (A4 size: 794x1123 px at 96dpi) */}
        {printInvoiceData && (
          <div ref={printContainerRef} style={{ width: 794, minHeight: 1123, background: "white", padding: 24 }}>
            <InvoiceTemplate data={printInvoiceData} />
          </div>
        )}
      </div>
      <div className="bg-white border border-gray-300 rounded-3xl shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: 600 }}>
        <div
          className="overflow-x-auto custom-scrollbar flex-1"
          style={{ maxHeight: 500 }}
        >
          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="_id"
            className="min-w-[700px] !bg-white"
            scroll={{ x: '100%' }}
            pagination={false}
            sticky
            loading={isLoading}
          />
        </div>
        <div className="custom-pagination p-4">
          <Pagination
            current={current}
            pageSize={pageSize}
            total={data?.pagination?.total || 0}
            onChange={(page, size) => {
              setCurrent(page);
              if (size !== pageSize) {
                setPageSize(size);
                setCurrent(1);
              }
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} orders`}
            pageSizeOptions={['10', '20', '50', '100']}
          />
        </div>
        <Drawer
          title={viewOrder ? `Order #${viewOrder.orderNumber}` : ''}
          open={!!viewOrder}
          onClose={() => setViewOrder(null)}
          width={800}
          className="rounded-3xl"
          getContainer={false}
          destroyOnClose
          extra={
            <Button onClick={() => setViewOrder(null)} type="default">
              Close
            </Button>
          }
        >
          {viewOrder ? (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-lg mb-2">Customer: {viewOrder.customerName}</div>
                <div className="text-gray-600 text-sm mb-1">Order #: {viewOrder.orderNumber}</div>
                <div className="text-gray-600 text-sm mb-1">Date: {new Date(viewOrder.createdAt).toLocaleString()}</div>
                <div className="text-gray-600 text-sm mb-1">Subtotal: ৳{viewOrder.items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</div>
                <div className="text-red-500 text-sm mb-1">Discount: ৳{typeof viewOrder.discount === 'number' ? viewOrder.discount.toFixed(2) : (viewOrder.items.reduce((sum, item) => sum + item.totalPrice, 0) - viewOrder.totalAmount).toFixed(2)}</div>
                <div className="text-green-700 text-base font-bold mb-1">Final Total: ৳{viewOrder.totalAmount.toFixed(2)}</div>
                {viewOrder.notes && <div className="text-gray-600 text-sm mb-1">Notes: {viewOrder.notes}</div>}
              </div>
              <div>
                <div className="font-semibold mb-2">Items</div>
                <Table
                  columns={[
                    { title: 'Product', dataIndex: ['product', 'name'], key: 'product' },
                    { title: 'SKU', dataIndex: ['product', 'sku'], key: 'sku' },
                    { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
                    { title: 'Unit Price', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `৳${v.toFixed(2)}` },
                    { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice', render: (v: number) => `৳${v.toFixed(2)}` },
                  ]}
                  dataSource={viewOrder.items}
                  rowKey={(_, idx) => String(idx)}
                  pagination={false}
                  size="small"
                  bordered
                />
              </div>
            </div>
          ) : <Spin />}
        </Drawer>
      </div>
    </>
  );
} 