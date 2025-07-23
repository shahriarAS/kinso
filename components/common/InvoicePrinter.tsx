import React, { useEffect, useRef } from "react";
import { useGetOrderQuery } from "@/features/orders/api";
import { useGetSettingsQuery } from "@/features/settings";
import { mapOrderToInvoiceDataWithSettings } from "@/features/orders/utils";
import InvoiceTemplate from "@/app/dashboard/pos/InvoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

interface InvoicePrinterProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

const InvoicePrinter: React.FC<InvoicePrinterProps> = ({ orderId, open, onClose }) => {
  const { data: orderData, isLoading: orderLoading } = useGetOrderQuery(orderId, { skip: !open });
  const { data: settingsData } = useGetSettingsQuery(undefined, { skip: !open });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && orderData && printRef.current) {
      setTimeout(async () => {
        const input = printRef.current;
        if (!input) return;
        const canvas = await html2canvas(input, { scale: 2, backgroundColor: "#fff" });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.autoPrint();
        const pdfBlob = pdf.output("bloburl");
        window.open(pdfBlob);
        onClose();
      }, 100);
    }
  }, [open, orderData, onClose]);

  if (!open) return null;

  // Wait for both order and settings to load
  if (orderLoading || !orderData) return null;

  const invoiceData = mapOrderToInvoiceDataWithSettings(
    orderData.data,
    settingsData?.data
  );

  return (
    <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1, width: 794, height: 1123, background: "white" }}>
      <div
        ref={printRef}
        style={{ width: 794, minHeight: 1123, background: "white", padding: 24 }}
      >
        <InvoiceTemplate data={invoiceData} />
      </div>
    </div>
  );
};

export default InvoicePrinter; 