import { Sale } from "@/features/sales/types";
import { Settings } from "@/features/settings/types";
import { InvoiceData } from "@/types";

export function mapSaleToInvoiceData(
  sale: Sale,
  settings?: Settings,
  userFullName?: string
): InvoiceData {
  // Calculate paid and due amounts
  const paid = sale.paymentMethods?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;
  const due = Math.max(0, sale.totalAmount - paid);

  // Map sale items to invoice items
  const items = sale.items.map((item, index) => ({
    title: item.stock?.product?.name || `Item ${index + 1}`,
    description: item.stock?.product?.barcode ? `Barcode: ${item.stock.product.barcode}` : undefined,
    quantity: item.quantity,
    rate: item.unitPrice,
    price: item.quantity * item.unitPrice,
    warranty: "N/A", // You might want to add warranty info to your product model
  }));

  // Calculate subtotal (before discount)
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  const invoiceData: InvoiceData = {
    _id: sale._id,
    invoiceNumber: sale.saleId,
    date: new Date(sale.saleDate).toLocaleDateString(),
    customer: {
      name: sale.customer?.name || "Walk-in Customer",
      email: sale.customer?.contactInfo?.email,
      phone: sale.customer?.contactInfo?.phone || "N/A",
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

// Simple number to words conversion - you might want to use a library for this
function numberToWords(amount: number): string {
  if (amount === 0) return "zero taka only";
  
  // This is a simplified version - you might want to use a proper library
  const ones = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
  ];
  
  const tens = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
  ];
  
  function convertHundreds(num: number): string {
    let result = "";
    
    if (num >= 100) {
      result += ones[Math.floor(num / 100)] + " hundred ";
      num %= 100;
    }
    
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }
    
    if (num > 0) {
      result += ones[num] + " ";
    }
    
    return result;
  }
  
  let result = "";
  let crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  
  let lakh = Math.floor(amount / 100000);
  amount %= 100000;
  
  let thousand = Math.floor(amount / 1000);
  amount %= 1000;
  
  if (crore > 0) {
    result += convertHundreds(crore) + "crore ";
  }
  
  if (lakh > 0) {
    result += convertHundreds(lakh) + "lakh ";
  }
  
  if (thousand > 0) {
    result += convertHundreds(thousand) + "thousand ";
  }
  
  if (amount > 0) {
    result += convertHundreds(amount);
  }
  
  return (result + "taka only").trim();
}
