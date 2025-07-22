import React, { useMemo } from "react";

interface InvoiceItem {
  title: string;
  description?: string;
  quantity: number;
  rate: number;
  price: number;
  warranty?: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  logo: string;
  mobile?: string;
  email?: string;
  soldBy?: string;
}

interface CustomerInfo {
  name: string;
  email?: string;
  phone: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  company: CompanyInfo;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  signatory: {
    name: string;
    title: string;
  };
  payments?: { method: string; amount: number }[];
  paid?: number;
  due?: number;
  inWords?: string;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

const formatCurrency = (amount: number) =>
  `TK ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data }) => {
  const paid = useMemo(
    () =>
      data.paid !== undefined
        ? data.paid
        : data.payments
          ? data.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
          : data.total,
    [data.paid, data.payments, data.total],
  );

  const due = useMemo(
    () => (data.due !== undefined ? data.due : Math.max(0, data.total - paid)),
    [data.due, data.total, paid],
  );

  // const totalQty = useMemo(() => (
  //   data.items.reduce((sum, item) => sum + item.quantity, 0)
  // ), [data.items]);

  // Common style objects
  const borderColor = { borderColor: "#e5e7eb" };
  const textGray = { color: "#374151" };
  const textPrimary = { color: "#2563eb" };
  const textDanger = { color: "#ef4444" };
  const logoBg = { backgroundColor: "#18181b" };
  const logoText = { color: "#fff" };
  const companyName = { color: "#18181b" };
  const signatureBorder = { borderColor: "#9ca3af" };
  const tableHeaderBg = { backgroundColor: "#f9fafb" };
  const paymentBox = {
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 10,
    paddingBottom: 10,
  };

  return (
    <>
      {/* Print styles for invoice */}
      <div className="print-invoice-wrapper">
        <div
          className="print-invoice min-h-screen max-w-3xl mx-auto p-6 font-sans text-sm bg-white relative"
          style={{ fontSize: 13, ...borderColor, backgroundColor: "#fff" }}
        >
          {/* Header: Logo + Company Info + Invoice Title/No/Date */}
          <div className="flex justify-between items-start mb-4 gap-4">
            {/* Logo and Company Info */}
            <div className="flex flex-col items-start min-w-[120px]">
              <div
                className="w-14 h-14 rounded flex items-center justify-center mb-2"
                style={logoBg}
              >
                <span className="font-bold text-xl" style={logoText}>
                  {data.company.logo || "Ez"}
                </span>
              </div>
              <div className="space-y-0.5 text-xs" style={textGray}>
                <div className="font-bold text-base mb-0.5" style={companyName}>
                  {data.company.name}
                </div>
                <div>
                  <span className="font-semibold">Address:</span>{" "}
                  {data.company.address}
                </div>
                {data.company.mobile && (
                  <div>
                    <span className="font-semibold">Mobile:</span>{" "}
                    {data.company.mobile}
                  </div>
                )}
                {data.company.email && (
                  <div>
                    <span className="font-semibold">Email:</span>{" "}
                    {data.company.email}
                  </div>
                )}
                {data.company.soldBy && (
                  <div>
                    <span className="font-semibold">Sold By:</span>{" "}
                    {data.company.soldBy}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {/* Invoice Title/No/Date */}
              <div className="flex-1 flex flex-col items-end">
                <h1
                  className="text-3xl font-bold mb-1 tracking-tight"
                  style={textPrimary}
                >
                  INVOICE
                </h1>
                <div className="text-xs space-y-0.5 text-right">
                  <div>
                    <span className="font-semibold">Invoice No:</span>{" "}
                    {data.invoiceNumber}
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span> {data.date}
                  </div>
                </div>
              </div>
              {/* Billing To Section */}
              <div className="mb-4 mt-2 text-right w-full">
                <p className="text-xs font-semibold mb-1">Billing To</p>
                <div className="text-xs space-y-0.5">
                  <div>{data.customer.name}</div>
                  {data.customer.phone && <div>{data.customer.phone}</div>}
                  {data.customer.email && <div>{data.customer.email}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div
            className="border rounded mb-4 overflow-hidden"
            style={borderColor}
          >
            <table className="w-full text-xs">
              <thead>
                <tr style={tableHeaderBg}>
                  <th
                    className="border-r px-2 py-3 text-left font-semibold align-middle"
                    style={borderColor}
                  >
                    SL.
                  </th>
                  <th
                    className="border-r px-2 py-3 text-left font-semibold align-middle"
                    style={borderColor}
                  >
                    Item Description
                  </th>
                  <th
                    className="border-r px-2 py-3 text-center font-semibold align-middle"
                    style={borderColor}
                  >
                    Warranty
                  </th>
                  <th
                    className="border-r px-2 py-3 text-right font-semibold align-middle"
                    style={borderColor}
                  >
                    Price
                  </th>
                  <th
                    className="border-r px-2 py-3 text-center font-semibold align-middle"
                    style={borderColor}
                  >
                    Qty
                  </th>
                  <th className="px-2 py-3 text-right font-semibold align-middle">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx} className="border-t" style={borderColor}>
                    <td
                      className="border-r px-2 py-3 align-middle"
                      style={borderColor}
                    >
                      {idx + 1}
                    </td>
                    <td
                      className="border-r px-2 py-3 align-middle"
                      style={borderColor}
                    >
                      {item.title}
                      {item.description && (
                        <span
                          className="block text-[11px]"
                          style={{ color: "#6b7280" }}
                        >
                          ({item.description})
                        </span>
                      )}
                    </td>
                    <td
                      className="border-r px-2 py-3 text-center align-middle"
                      style={borderColor}
                    >
                      {item.warranty || "N/A"}
                    </td>
                    <td
                      className="border-r px-2 py-3 text-right align-middle"
                      style={borderColor}
                    >
                      {item.rate}
                    </td>
                    <td
                      className="border-r px-2 py-3 text-center align-middle"
                      style={borderColor}
                    >
                      {item.quantity}
                    </td>
                    <td
                      className="px-2 py-3 text-right align-middle"
                      style={borderColor}
                    >
                      {item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-3">
            <div className="w-56 text-xs flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="font-semibold">Subtotal :</span>
                <span>{formatCurrency(data.subtotal)}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between">
                  <span className="font-semibold">Discount :</span>
                  <span>- {formatCurrency(data.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold">Total:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Paid:</span>
                <span>{formatCurrency(paid)}</span>
              </div>
              {due > 0 && (
                <div className="flex justify-between">
                  <span className="font-semibold">Due:</span>
                  <span style={textDanger}>{formatCurrency(due)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mb-3 text-xs">
            <span className="font-semibold">In Words:</span>{" "}
            <span className="font-normal capitalize">{data.inWords || ""}</span>
          </div>

          {/* Payment Details */}
          {data.payments && data.payments.length > 0 && (
            <div className="mb-4">
              {/* <div className="font-semibold mb-1 text-[11px]">Payment Details</div> */}
              <table className="border w-full text-[11px]" style={borderColor}>
                <thead>
                  <tr style={tableHeaderBg}>
                    <th
                      className="border-r px-1 py-1 text-left font-semibold align-middle"
                      style={borderColor}
                    >
                      Payment Method
                    </th>
                    <th className="px-1 py-1 text-left font-semibold align-middle">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((p, idx) => (
                    <tr key={idx}>
                      <td
                        className="border-r border-t px-1 py-1 align-middle"
                        style={borderColor}
                      >
                        {p.method}
                      </td>
                      <td
                        className="border-t px-1 py-1 align-middle"
                        style={borderColor}
                      >
                        {formatCurrency(Number(p.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-1">
                <div
                  className="border px-2 py-1 font-semibold text-[11px] payment-total-box"
                  style={paymentBox}
                >
                  Paid: {formatCurrency(paid)}
                </div>
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="flex flex-col flex-grow justify-end min-h-[80px] absolute bottom-0 left-0 right-0 w-full p-6">
            <div className="flex justify-between items-end mt-8 mb-2 print-invoice-signature-section w-full">
              <div className="text-center">
                <div
                  className="h-12 border-b w-40 mb-1"
                  style={signatureBorder}
                ></div>
                <div className="font-semibold text-xs">Received By</div>
              </div>
              <div className="text-center">
                <div
                  className="h-12 border-b w-40 mb-1"
                  style={signatureBorder}
                ></div>
                <div className="font-semibold text-xs">Authorised By</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceTemplate;
