import React from 'react';

// TypeScript interfaces for type safety
interface InvoiceItem {
  description: string;
  details?: string;
  quantity: number;
  rate: number;
  price: number;
}

interface CompanyInfo {
  name: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}

interface CustomerInfo {
  name: string;
  location: string;
  id: string;
  email?: string;
  phone?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerId: string;
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
}

interface FlowInvoiceProps {
  data?: InvoiceData;
}

const InvoiceTemplate: React.FC<FlowInvoiceProps> = ({ data }) => {
  // Default data if none provided
  const defaultData: InvoiceData = {
    invoiceNumber: "00241683072.1.0",
    date: "02nd December, 2018",
    customerId: "AA11241553996",
    customer: {
      name: "KATELYN LAMBERT",
      location: "New York, NY",
      id: "AA11241553996"
    },
    company: {
      name: "FLOW",
      location: "NEWYORK, USA",
      address: "4 Washington Square - Apt C1F02",
      phone: "+1-202-555-0127",
      email: "info@yourdomain.com",
      website: "www.yourdomain.com",
      logo: "II"
    },
    items: [
      {
        description: "Brand Identity Design",
        details: "Lorem ipsum dolor sit amet consectetur adipiscing elitenid diam sit amet consectetur",
        quantity: 5,
        rate: 50.00,
        price: 2500.00
      },
      {
        description: "Resume Template Design",
        details: "Lorem ipsum dolor sit amet consectetur adipiscing elitenid diam sit amet",
        quantity: 3,
        rate: 20.00,
        price: 600.00
      },
      {
        description: "Newsletter Design",
        details: "Adipiscing consectetur lorem ipsum dolor sit amet consectetur",
        quantity: 10,
        rate: 100.00,
        price: 1000.00
      },
      {
        description: "Business Proposal",
        details: "Adipiscing consectetur lorem ipsum dolor sit amet consectetur",
        quantity: 3,
        rate: 70.00,
        price: 2100.00
      },
      {
        description: "Web Template Design",
        details: "Sapien rhoncus elit adipiscing consectetur lorem ipsum consectetur",
        quantity: 3,
        rate: 500.00,
        price: 1500.00
      }
    ],
    subtotal: 10700.00,
    discount: 15,
    total: 10200.00,
    signatory: {
      name: "Kandace Forrester",
      title: "KANDACE FORRESTER"
    }
  };

  const invoiceData = data || defaultData;

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white font-sans text-sm leading-tight">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-xs text-gray-600 space-y-0.5 leading-relaxed">
          {/* <div className="font-medium text-black">{invoiceData.company.location}</div>
          <div>{invoiceData.company.address}</div>
          <div>{invoiceData.company.phone}</div>
          <div>{invoiceData.company.email}</div>
          <div className="pt-1">{invoiceData.company.website}</div> */}
        </div>
        <div className="text-right">
          <div className="w-10 h-10 bg-black flex items-center justify-center mb-2">
            <span className="text-white font-bold text-base">{invoiceData.company.logo}</span>
          </div>
          {/* <div className="font-bold text-lg tracking-wider">{invoiceData.company.name}</div> */}
        </div>
      </div>

      {/* Invoice Header */}
      <div className="flex mb-6">
        <div className="bg-gray-800 text-white px-5 py-3 flex-shrink-0">
          <h1 className="text-base font-semibold tracking-wide">INVOICE</h1>
        </div>
        <div className="border border-l-0 border-gray-300 flex-1 grid grid-cols-3 text-xs">
          <div className="p-2.5 border-r border-gray-300">
            <div className="text-gray-500 mb-1">Invoice No.</div>
            <div className="font-medium">{invoiceData.invoiceNumber}</div>
          </div>
          <div className="p-2.5 border-r border-gray-300">
            <div className="text-gray-500 mb-1">Date:</div>
            <div className="font-medium">{invoiceData.date}</div>
          </div>
          <div className="p-2.5">
            <div className="text-gray-500 mb-1">Customer ID:</div>
            <div className="font-medium">{invoiceData.customerId}</div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="flex justify-between mb-6">
        <div>
          <div className="text-xs text-gray-500 mb-1">Invoice to:</div>
          <div className="font-semibold text-sm">{invoiceData.customer.name}</div>
        </div>
        <div className="text-right text-xs">
          {invoiceData.customer.email && (
            <div className="text-gray-600 mb-0.5">{invoiceData.customer.email}</div>
          )}
          {invoiceData.customer.phone && (
            <div className="text-gray-600">{invoiceData.customer.phone}</div>
          )}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="mb-5">
        {/* Table Header */}
        <div className="border-t border-l border-r border-black bg-white">
          <div className="grid grid-cols-12 text-xs font-medium text-black border-b border-black">
            <div className="col-span-6 p-2.5 border-r border-black">DESCRIPTION</div>
            <div className="col-span-2 p-2.5 border-r border-black text-center">QTY.</div>
            <div className="col-span-2 p-2.5 border-r border-black text-center">RATE</div>
            <div className="col-span-2 p-2.5 text-center">PRICE</div>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="border-l border-r border-black">
          {invoiceData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 text-xs border-b border-black">
              <div className="col-span-6 p-2.5 border-r border-black">
                <div className="font-medium mb-1">{item.description}</div>
                {item.details && (
                  <div className="text-gray-600 text-xs leading-snug">{item.details}</div>
                )}
              </div>
              <div className="col-span-2 p-2.5 border-r border-black text-center align-top pt-3">
                {item.quantity.toString().padStart(2, '0')}
              </div>
              <div className="col-span-2 p-2.5 border-r border-black text-center align-top pt-3">
                {formatCurrency(item.rate)}
              </div>
              <div className="col-span-2 p-2.5 text-center align-top pt-3">
                {formatCurrency(item.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="w-1/3">
          <div className="text-xs text-gray-500 mb-2">Sincerely,</div>
          <div className="text-xl text-gray-700 mb-2 font-cursive leading-tight">
            {invoiceData.signatory.name}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">{invoiceData.signatory.title}</div>
        </div>
        <div className="w-1/3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">SUB TOTAL</span>
              <span className="font-medium">{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            {typeof invoiceData.discount === 'number' && invoiceData.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">DISCOUNT</span>
                <span className="font-medium">- {formatCurrency(invoiceData.discount)}</span>
              </div>
            )}
          </div>

          <div className="mt-4 text-center bg-gray-50 py-3 px-4 rounded">
            <div className="text-xl font-bold text-gray-800">{formatCurrency(invoiceData.total)}</div>
            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-medium">TOTAL AMOUNT</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .font-cursive {
          font-family: 'Brush Script MT', cursive;
        }
        .font-sans {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default InvoiceTemplate;