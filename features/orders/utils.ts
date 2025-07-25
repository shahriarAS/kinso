import { Order } from "./types";
import { InvoiceData } from "@/types";
import { ToWords } from "to-words";

// Accepts order and settings (with invoiceFooter)
export function mapOrderToInvoiceDataWithSettings(
  order: Order,
  settings?: {
    invoiceFooter?: string;
    invoiceFooterTitle?: string;
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;
  },
  cashierName?: string,
): InvoiceData {
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
  const toWords = new ToWords({ localeCode: "en-BD", converterOptions: { currency: false } });
  const inWords = toWords.convert(order.totalAmount) + " Taka Only";

  return {
    invoiceNumber: order.orderNumber || "N/A",
    date: new Date(order.createdAt).toLocaleDateString(),
    customer: {
      name: customerObj ? customerObj.name : order.customerName || "N/A",
      email: customerObj
        ? customerObj.email || ""
        : "",
      phone: customerObj ? customerObj.phone || "" : "",
    },
    company: {
      name: settings?.companyName || "",
      address: settings?.companyAddress || "",
      logo: "/images/brand/logo.png",
      mobile: settings?.companyPhone || "",
      email: settings?.companyEmail || "",
      soldBy: cashierName || "Cashier Name",
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
    // signatory: {
    //   name: "Cashier Name",
    //   title: "Cashier",
    // },
    payments,
    paid,
    due,
    inWords,
    invoiceFooter: settings?.invoiceFooter,
    invoiceFooterTitle: settings?.invoiceFooterTitle,
  };
}
