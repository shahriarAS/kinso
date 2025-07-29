import { Sale } from "@/features/sales/types";
import { Settings } from "@/features/settings/types";
import { InvoiceData } from "@/types";
import { ToWords } from "to-words";

export function mapSaleToInvoiceData(
  sale: Sale,
  settings?: Settings,
  userFullName?: string
): InvoiceData {
  // Calculate paid and due amounts
  const paid = sale.paymentMethods?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
  const due = Math.max(0, sale.totalAmount - paid);

  // Map sale items to invoice items
  const items = sale.items.map((item, index) => {
    const product = item.stock?.product;
    const productName = product?.name || `Item ${index + 1}`;
    const barcode = product?.barcode;
    
    return {
      title: productName,
      description: barcode ? `Barcode: ${barcode}` : undefined,
      quantity: item.quantity,
      rate: item.unitPrice,
      price: item.quantity * item.unitPrice,
      warranty: "N/A", // You might want to add warranty info to your product model
    };
  });

  // Calculate subtotal (before discount)
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const invoiceData: InvoiceData = {
    _id: sale._id,
    invoiceNumber: sale.saleId,
    date: new Date(sale.saleDate).toLocaleDateString(),
    customer: {
      name: sale.customer?.name || "Walk-in Customer",
      email: sale.customer?.email,
      phone: sale.customer?.phone || "N/A",
    },
    company: {
      name: settings?.companyName || "Kinso",
      address: settings?.companyAddress || "Business Address",
      logo: "Kinso", // You might want to add logo support to settings
      mobile: settings?.companyPhone,
      email: settings?.companyEmail,
      soldBy: userFullName,
    },
    items,
    subtotal,
    discount: sale.discountAmount || 0,
    total: sale.totalAmount,
    payments: sale.paymentMethods?.map(p => ({
      method: p.method,
      amount: p.amount,
    })),
    paid,
    due,
    inWords: numberToWords(sale.totalAmount), // You might want to implement this
    invoiceFooter: settings?.invoiceFooter,
    invoiceFooterTitle: settings?.invoiceFooterTitle,
  };

  return invoiceData;
}

// Initialize ToWords converter
const toWords = new ToWords();

function numberToWords(amount: number): string {
  if (amount === 0) return "zero taka only";
  
  try {
    const words = toWords.convert(amount);
    return `${words} taka only`.toLowerCase();
  } catch (error) {
    console.error("Error converting number to words:", error);
    return `${amount} taka only`;
  }
}
