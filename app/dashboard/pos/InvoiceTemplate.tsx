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
    return `৳${amount.toFixed(2)}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-sm leading-tight" style={{ background: '#fff' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="text-xs space-y-0.5 leading-relaxed" style={{ color: '#6b7280' }}>
          {/* <div style={{ fontWeight: 500, color: '#111827' }}>{invoiceData.company.location}</div>
          <div>{invoiceData.company.address}</div>
          <div>{invoiceData.company.phone}</div>
          <div>{invoiceData.company.email}</div>
          <div style={{ paddingTop: 4 }}>{invoiceData.company.website}</div> */}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ width: 40, height: 40, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{invoiceData.company.logo}</span>
          </div>
          {/* <div style={{ fontWeight: 'bold', fontSize: 18, letterSpacing: 2 }}>{invoiceData.company.name}</div> */}
        </div>
      </div>

      {/* Invoice Header */}
      <div className="flex mb-6">
        <div style={{ background: '#1f2937', color: '#fff', padding: '12px 20px', flexShrink: 0 }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>INVOICE</h1>
        </div>
        <div style={{ border: '1px solid #d1d5db', borderLeft: 0, flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', fontSize: 12 }}>
          <div style={{ padding: 10, borderRight: '1px solid #d1d5db' }}>
            <div style={{ color: '#6b7280', marginBottom: 4 }}>Invoice No.</div>
            <div style={{ fontWeight: 500 }}>{invoiceData.invoiceNumber}</div>
          </div>
          <div style={{ padding: 10, borderRight: '1px solid #d1d5db' }}>
            <div style={{ color: '#6b7280', marginBottom: 4 }}>Date:</div>
            <div style={{ fontWeight: 500 }}>{invoiceData.date}</div>
          </div>
          <div style={{ padding: 10 }}>
            <div style={{ color: '#6b7280', marginBottom: 4 }}>Customer ID:</div>
            <div style={{ fontWeight: 500 }}>{invoiceData.customerId}</div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="flex justify-between mb-6">
        <div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Invoice to:</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{invoiceData.customer.name}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12 }}>
          {invoiceData.customer.email && (
            <div style={{ color: '#6b7280', marginBottom: 2 }}>{invoiceData.customer.email}</div>
          )}
          {invoiceData.customer.phone && (
            <div style={{ color: '#6b7280' }}>{invoiceData.customer.phone}</div>
          )}
        </div>
      </div>

      {/* Invoice Table */}
      <div style={{ marginBottom: 20 }}>
        {/* Table Header */}
        <div style={{ borderTop: '1px solid #000', borderLeft: '1px solid #000', borderRight: '1px solid #000', background: '#fff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '6fr 2fr 2fr 2fr', fontSize: 12, fontWeight: 500, color: '#111', borderBottom: '1px solid #000' }}>
            <div style={{ padding: 10, borderRight: '1px solid #000' }}>DESCRIPTION</div>
            <div style={{ padding: 10, borderRight: '1px solid #000', textAlign: 'center' }}>QTY.</div>
            <div style={{ padding: 10, borderRight: '1px solid #000', textAlign: 'center' }}>RATE</div>
            <div style={{ padding: 10, textAlign: 'center' }}>PRICE</div>
          </div>
        </div>
        {/* Table Body */}
        <div style={{ borderLeft: '1px solid #000', borderRight: '1px solid #000' }}>
          {invoiceData.items.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '6fr 2fr 2fr 2fr', fontSize: 12, borderBottom: '1px solid #000' }}>
              <div style={{ padding: 10, borderRight: '1px solid #000' }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.description}</div>
                {item.details && (
                  <div style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.3 }}>{item.details}</div>
                )}
              </div>
              <div style={{ padding: 10, borderRight: '1px solid #000', textAlign: 'center', verticalAlign: 'top', paddingTop: 12 }}>
                {item.quantity.toString().padStart(2, '0')}
              </div>
              <div style={{ padding: 10, borderRight: '1px solid #000', textAlign: 'center', verticalAlign: 'top', paddingTop: 12 }}>
                {formatCurrency(item.rate)}
              </div>
              <div style={{ padding: 10, textAlign: 'center', verticalAlign: 'top', paddingTop: 12 }}>
                {formatCurrency(item.price)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-between items-start mb-4">
        <div style={{ width: '33%' }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Sincerely,</div>
          <div style={{ fontSize: 24, color: '#374151', marginBottom: 8, fontFamily: 'Brush Script MT, cursive', lineHeight: 1 }}>{invoiceData.signatory.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>{invoiceData.signatory.title}</div>
        </div>
        <div style={{ width: '33%' }}>
          <div style={{ fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#6b7280' }}>SUB TOTAL</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            {typeof invoiceData.discount === 'number' && invoiceData.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#6b7280' }}>DISCOUNT</span>
                <span style={{ fontWeight: 500, color: '#ef4444' }}>- {formatCurrency(invoiceData.discount)}</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16, textAlign: 'center', background: '#f9fafb', padding: '12px 16px', borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>{formatCurrency(invoiceData.total)}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, textTransform: 'uppercase', fontWeight: 500, letterSpacing: 1 }}>TOTAL AMOUNT</div>
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