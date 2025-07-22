import React from "react";

interface InvoiceItem {
  title: string;
  description?: string;
  quantity: number;
  rate: number;
  price: number;
}

interface CompanyInfo {
  name: string;
  address: string;
  logo: string;
}

interface CustomerInfo {
  name: string;
  email: string;
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
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 font-sans text-sm leading-tight" style={{ background: "#fff" }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div></div>
        <div style={{ textAlign: "right" }}>
          <div style={{ width: 40, height: 40, background: "#000", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <span style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>{data.company.logo}</span>
          </div>
        </div>
      </div>

      {/* Invoice Header */}
      <div className="flex mb-6">
        <div style={{ background: "#1f2937", color: "#fff", padding: "12px 20px", flexShrink: 0 }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>INVOICE</h1>
        </div>
        <div style={{ border: "1px solid #d1d5db", borderLeft: 0, flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", fontSize: 12 }}>
          <div style={{ padding: 10, borderRight: "1px solid #d1d5db" }}>
            <div style={{ color: "#6b7280", marginBottom: 4 }}>Invoice No.</div>
            <div style={{ fontWeight: 500 }}>{data.invoiceNumber}</div>
          </div>
          <div style={{ padding: 10, borderRight: "1px solid #d1d5db" }}>
            <div style={{ color: "#6b7280", marginBottom: 4 }}>Date:</div>
            <div style={{ fontWeight: 500 }}>{data.date}</div>
          </div>
          <div style={{ padding: 10 }}>
            <div style={{ color: "#6b7280", marginBottom: 4 }}>Customer</div>
            <div style={{ fontWeight: 500 }}>{data.customer.name}</div>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ borderTop: "1px solid #000", borderLeft: "1px solid #000", borderRight: "1px solid #000", background: "#fff" }}>
          <div style={{ display: "grid", gridTemplateColumns: "6fr 2fr 2fr 2fr", fontSize: 12, fontWeight: 500, color: "#111", borderBottom: "1px solid #000" }}>
            <div style={{ padding: 10, borderRight: "1px solid #000" }}>DESCRIPTION</div>
            <div style={{ padding: 10, borderRight: "1px solid #000", textAlign: "center" }}>QTY.</div>
            <div style={{ padding: 10, borderRight: "1px solid #000", textAlign: "center" }}>RATE</div>
            <div style={{ padding: 10, textAlign: "center" }}>PRICE</div>
          </div>
        </div>
        <div style={{ borderLeft: "1px solid #000", borderRight: "1px solid #000" }}>
          {data.items.map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "6fr 2fr 2fr 2fr", fontSize: 12, borderBottom: "1px solid #000" }}>
              <div style={{ padding: 10, borderRight: "1px solid #000" }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                {item.description && <div style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.3 }}>{item.description}</div>}
              </div>
              <div style={{ padding: 10, borderRight: "1px solid #000", textAlign: "center", verticalAlign: "top", paddingTop: 12 }}>{item.quantity.toString().padStart(2, "0")}</div>
              <div style={{ padding: 10, borderRight: "1px solid #000", textAlign: "center", verticalAlign: "top", paddingTop: 12 }}>{formatCurrency(item.rate)}</div>
              <div style={{ padding: 10, textAlign: "center", verticalAlign: "top", paddingTop: 12 }}>{formatCurrency(item.price)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-between items-start mb-4">
        <div style={{ width: "33%" }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Sincerely,</div>
          <div style={{ fontSize: 24, color: "#374151", marginBottom: 8, fontFamily: "Brush Script MT, cursive", lineHeight: 1 }}>{data.signatory.name}</div>
          <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>{data.signatory.title}</div>
        </div>
        <div style={{ width: "33%" }}>
          <div style={{ fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#6b7280" }}>SUB TOTAL</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#6b7280" }}>DISCOUNT</span>
                <span style={{ fontWeight: 500, color: "#ef4444" }}>- {formatCurrency(data.discount)}</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: 16, textAlign: "center", background: "#f9fafb", padding: "12px 16px", borderRadius: 8 }}>
            <div style={{ fontSize: 20, fontWeight: "bold", color: "#1f2937" }}>{formatCurrency(data.total)}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, textTransform: "uppercase", fontWeight: 500, letterSpacing: 1 }}>TOTAL AMOUNT</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .font-cursive {
          font-family: "Brush Script MT", cursive;
        }
        .font-sans {
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
        }
      `}</style>
    </div>
  );
};

export default InvoiceTemplate;
