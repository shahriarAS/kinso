export interface Settings {
  _id: string;
  invoiceFooter?: string;
  invoiceFooterTitle?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsInput {
  invoiceFooter?: string;
  invoiceFooterTitle?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
}

export interface SettingsUpdateInput {
  invoiceFooter?: string;
  invoiceFooterTitle?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
}

export interface SettingsResponse {
  success: boolean;
  data?: Settings;
  message?: string;
}

export interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface InvoiceSettings {
  footer: string;
  footerTitle: string;
}

export interface SystemSettings {
  company: CompanyInfo;
  invoice: InvoiceSettings;
}
