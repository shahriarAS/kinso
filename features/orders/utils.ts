import { Order } from "./types";
import { InvoiceData } from "@/app/dashboard/pos/InvoiceTemplate";

// Accepts order and settings (with invoiceFooter)
export function mapOrderToInvoiceDataWithSettings(
  order: Order,
  settings?: { invoiceFooter?: string; invoiceFooterTitle?: string },
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
    invoiceFooter: settings?.invoiceFooter,
    invoiceFooterTitle: settings?.invoiceFooterTitle,
  };
}
