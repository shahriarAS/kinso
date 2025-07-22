"use client";
import React, { useState, useEffect } from "react";
import { Order } from "@/features/orders/types";
import { useGetOrdersQuery } from "@/features/orders/api";
import InvoiceTemplate, {
  InvoiceData,
} from "@/app/dashboard/pos/InvoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import ViewOrderDrawer from "./ViewOrderDrawer";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";

interface Props {
  searchTerm: string;
  paymentMethodFilter: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  warehouseFilter?: string;
  productFilter?: string;
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
  const discount =
    typeof order.discount === "number"
      ? order.discount
      : subtotal - order.totalAmount;
  const payments =
    order.payments?.map((p) => ({
      method: p.method || "Cash",
      amount: Number(p.amount) || 0,
      date: (p as any).date || "-", // fallback to dummy
      by: (p as any).by || "-", // fallback to dummy
    })) || [];
  const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const due = Math.max(0, order.totalAmount - paid);

  // Fallback numberToWords if not available
  function numberToWords(num: number): string {
    if (num === 0) return "zero";
    const belowTwenty = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const thousand = 1000;
    const lakh = 100000;
    function helper(n: number): string {
      if (n < 20) return belowTwenty[n];
      if (n < 100)
        return (
          tens[Math.floor(n / 10)] + (n % 10 ? " " + belowTwenty[n % 10] : "")
        );
      if (n < thousand)
        return (
          belowTwenty[Math.floor(n / 100)] +
          " hundred" +
          (n % 100 ? " " + helper(n % 100) : "")
        );
      if (n < lakh)
        return (
          helper(Math.floor(n / thousand)) +
          " thousand" +
          (n % thousand ? " " + helper(n % thousand) : "")
        );
      return (
        helper(Math.floor(n / lakh)) +
        " lakh" +
        (n % lakh ? " " + helper(n % lakh) : "")
      );
    }
    return helper(num);
  }
  const inWords = numberToWords(order.totalAmount) + " Taka Only";

  return {
    invoiceNumber: order.orderNumber || "N/A",
    date: new Date(order.createdAt).toLocaleDateString(),
    customer: {
      name: customerObj ? customerObj.name : order.customerName || "N/A",
      email: customerObj
        ? customerObj.email || "dummy@email.com"
        : "dummy@email.com",
      phone: customerObj ? customerObj.phone || "0123456789" : "0123456789",
    },
    company: {
      name: "EZ POS",
      address: "123 Main St, Suite 100, Dhaka",
      logo: "EZ",
      mobile: "01700000000",
      email: "info@ezpos.com",
      soldBy: "Cashier Name",
    },
    items: order.items.map((item) => ({
      title: item.product.name,
      description: `SKU: ${item.product.sku}; UPC: ${item.product.upc}`,
      quantity: item.quantity,
      rate: item.unitPrice,
      price: item.totalPrice,
      warranty: item.product.warranty
        ? `${item.product.warranty.value} ${item.product.warranty.unit}`
        : "N/A",
      serial: (item.product as any).serial || "N/A",
    })),
    subtotal,
    discount,
    total: order.totalAmount,
    signatory: {
      name: "Cashier Name",
      title: "Cashier",
    },
    payments,
    paid,
    due,
    inWords,
  };
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
  if (warehouseFilter) params.warehouse = warehouseFilter;
  if (productFilter) params.product = productFilter;

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
