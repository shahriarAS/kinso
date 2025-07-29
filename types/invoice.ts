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
  _id?: string;
  invoiceNumber: string;
  date: string;
  customer: CustomerInfo;
  company: CompanyInfo;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  // signatory: {
  //     name: string;
  //     title: string;
  // };
  payments?: { method: string; amount: number }[];
  paid?: number;
  due?: number;
  inWords?: string;
  invoiceFooter?: string; // <-- add this
  invoiceFooterTitle?: string; // <-- add this
}
