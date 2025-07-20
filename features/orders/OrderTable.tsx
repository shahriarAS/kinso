"use client";
import { Table, Button, Tooltip, Pagination } from "antd";
import { Icon } from "@iconify/react";
import React, { useState, useEffect } from "react";
import { Order } from "@/features/orders/types";
import { useGetOrdersQuery } from "@/features/orders/api";
import InvoiceTemplate, {
  InvoiceData,
} from "@/app/dashboard/pos/InvoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ViewOrderDrawer from "./ViewOrderDrawer";

interface Props {
  searchTerm: string;
  paymentMethodFilter: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function mapOrderToInvoiceData(order: Order): InvoiceData {
  // Support both string and populated object for customerId
  const customerObj =
    typeof order.customerId === "object" && order.customerId !== null
      ? (order.customerId as {
          _id: string;
          name: string;
          email?: string;
          phone?: string;
        })
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

export default function OrderTable({
  searchTerm,
  paymentMethodFilter,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [printInvoiceData, setPrintInvoiceData] = useState<InvoiceData | null>(
    null,
  );

  const printContainerRef = React.useRef<HTMLDivElement>(null);

  // Prepare API params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any = {
    page: currentPage,
    limit: pageSize,
  };
  if (searchTerm) params.search = searchTerm;
  if (paymentMethodFilter) params.paymentMethod = paymentMethodFilter;

  const { data, isLoading } = useGetOrdersQuery(params);

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
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: false,
          backgroundColor: "#fff",
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        // Calculate width/height for A4
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.autoPrint();
        // Open PDF in new window and trigger print
        const pdfBlob = pdf.output("bloburl");
        window.open(pdfBlob);
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
      title: <span className="font-medium text-base">Payment Method</span>,
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method: string) => (
        <span className="font-medium text-blue-600">{method}</span>
      ),
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
      title: <span className="font-medium text-base">Final Total</span>,
      dataIndex: "totalAmount",
      key: "finalTotal",
      render: (amount: number) => {
        return (
          <span className="font-bold text-green-700">৳{amount.toFixed(2)}</span>
        );
      },
    },
    {
      title: <span className="font-medium text-base">Action</span>,
      key: "action",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: Order) => (
        <div className="flex gap-2">
          <Tooltip title="View Details">
            <Button
              className="inline-flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition p-1.5"
              onClick={() => handleView(record)}
            >
              <Icon icon="lineicons:eye" className="text-lg text-blue-700" />
            </Button>
          </Tooltip>
          <Tooltip title="Print">
            <Button
              className="inline-flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition p-1.5"
              onClick={() => handlePrint(record)}
            >
              <Icon
                icon="lineicons:printer"
                className="text-lg text-gray-700"
              />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <div
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          zIndex: -1,
          width: 794,
          height: 1123,
          background: "white",
        }}
      >
        {/* Hidden print container for PDF generation (A4 size: 794x1123 px at 96dpi) */}
        {printInvoiceData && (
          <div
            ref={printContainerRef}
            style={{
              width: 794,
              minHeight: 1123,
              background: "white",
              padding: 24,
            }}
          >
            <InvoiceTemplate data={printInvoiceData} />
          </div>
        )}
      </div>
      <div
        className="bg-white border border-gray-300 rounded-3xl shadow-lg overflow-hidden flex flex-col"
        style={{ maxHeight: 600 }}
      >
        <div
          className="overflow-x-auto custom-scrollbar flex-1"
          style={{ maxHeight: 500 }}
        >
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            className="min-w-[700px] !bg-white"
            scroll={{ x: "100%" }}
            pagination={false}
            sticky
            loading={isLoading}
          />
        </div>
        {pagination && (
          <div className="custom-pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={pagination.total}
              onChange={onPageChange}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} orders`
              }
            />
          </div>
        )}
        <ViewOrderDrawer
          open={!!viewOrder}
          setOpen={() => setViewOrder(null)}
          order={viewOrder}
          onClose={() => setViewOrder(null)}
        />
      </div>
    </>
  );
}
