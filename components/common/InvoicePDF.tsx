import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { InvoiceData } from "@/app/dashboard/pos/InvoiceTemplate";

// Register a font for better PDF rendering (optional)
// Font.register({
//   family: "Inter",
//   fonts: [
//     { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTcviYw.woff2" },
//   ],
// });

const styles = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 100, // Reserve space for signature section
    fontSize: 12,
    // fontFamily: "Inter",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 16,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#18181b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  companyInfo: {
    fontSize: 10,
    color: "#374151",
    marginBottom: 2,
  },
  companyName: {
    fontWeight: "bold",
    fontSize: 13,
    color: "#18181b",
    marginBottom: 2,
  },
  // Add section gap utility
  sectionGap: {
    marginTop: 18,
  },
  // Add line gap for item description
  itemTitle: {
    marginBottom: 2,
    // lineHeight: 1.2,
  },
  itemDescription: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.3,
  },
  invoiceTitle: {
    color: "#2563eb",
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 2,
    textAlign: "right",
  },
  invoiceMeta: {
    fontSize: 10,
    color: "#374151",
    textAlign: "right",
    marginBottom: 2,
  },
  billingTo: {
    fontSize: 10,
    textAlign: "right",
    marginTop: 8,
    marginBottom: 2,
    alignItems: "flex-end",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
  },
  tableCell: {
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 6,
    fontSize: 10,
    flexGrow: 1,
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellRight: {
    textAlign: "right",
  },
  totalsBox: {
    alignSelf: "flex-end",
    width: 120,
    fontSize: 10,
    marginBottom: 8,
    textAlign: "right",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    textAlign: "right",
  },
  textDanger: {
    color: "#ef4444",
  },
  inWords: {
    fontSize: 10,
    marginBottom: 8,
    marginTop: 12,
  },
  paymentTable: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    marginBottom: 8,
  },
  paymentCell: {
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 4,
    fontSize: 9,
    flexGrow: 1,
  },
  paymentCellLast: {
    borderRightWidth: 0,
  },
  paymentTotalBox: {
    // borderWidth: 1,
    // borderColor: "#e5e7eb",
    // backgroundColor: "#f9fafb",
    padding: 4,
    fontWeight: "bold",
    fontSize: 9,
    alignSelf: "flex-end",
    marginTop: 2,
    marginBottom: 2,
  },
  warrantyBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 8,
    fontSize: 10,
    marginTop: 12,
    marginBottom: 8,
  },
  warrantyTitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    marginTop: 0,
    marginBottom: 0,
  },
  signatureBox: {
    alignItems: "center",
    width: 160,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    height: 24,
    width: 160,
    marginBottom: 2,
  },
  signatureLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
});

const formatCurrency = (amount: number, showCurrency: boolean = false) =>
  `${showCurrency ? "BDT" : ""} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

const InvoicePDF: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const paid =
    data.paid !== undefined
      ? data.paid
      : data.payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) ||
        data.total;
  const due =
    data.due !== undefined ? data.due : Math.max(0, data.total - paid);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo and Company Info */}
          <View>
            {data.company.logo && data.company.logo !== "EZ" ? (
              <Image src={data.company.logo} style={styles.logoBox} />
            ) : (
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>EZ</Text>
              </View>
            )}
            <Text style={styles.companyName}>{data.company.name}</Text>
            <Text style={styles.companyInfo}>
              Address: {data.company.address}
            </Text>
            {data.company.mobile && (
              <Text style={styles.companyInfo}>
                Mobile: {data.company.mobile}
              </Text>
            )}
            {data.company.email && (
              <Text style={styles.companyInfo}>
                Email: {data.company.email}
              </Text>
            )}
            {data.company.soldBy && (
              <Text style={styles.companyInfo}>
                Sold By: {data.company.soldBy}
              </Text>
            )}
          </View>
          {/* Invoice Title/No/Date and Billing To */}
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              alignItems: "flex-end",
              textAlign: "right",
            }}
          >
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>
              Invoice No: {data.invoiceNumber}
            </Text>
            <Text style={styles.invoiceMeta}>Date: {data.date}</Text>
            <View style={styles.billingTo}>
              <Text
                style={{
                  fontWeight: "bold",
                  textAlign: "right",
                  marginBottom: 4,
                }}
              >
                Billing To
              </Text>
              <Text style={{ textAlign: "right", marginBottom: 2 }}>
                {data.customer.name}
              </Text>
              {data.customer.phone && (
                <Text style={{ textAlign: "right", marginBottom: 2 }}>
                  {data.customer.phone}
                </Text>
              )}
              {data.customer.email && (
                <Text style={{ textAlign: "right", marginBottom: 2 }}>
                  {data.customer.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={[styles.table, styles.sectionGap]}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]} fixed>
            <Text style={[styles.tableCell, { flex: 0.25 }]}>SL.</Text>
            <Text style={[styles.tableCell, { flex: 3 }]}>
              Item Description
            </Text>
            <Text
              style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}
            >
              Warranty
            </Text>
            <Text
              style={[styles.tableCell, styles.tableCellRight, { flex: 1 }]}
            >
              Price
            </Text>
            <Text
              style={[styles.tableCell, styles.tableCellCenter, { flex: 0.25 }]}
            >
              Qty
            </Text>
            <Text
              style={[
                styles.tableCell,
                styles.tableCellRight,
                styles.tableCellLast,
                { flex: 1 },
              ]}
            >
              Total
            </Text>
          </View>
          {/* Table Body */}
          {data.items.map((item, idx) => (
            <View style={styles.tableRow} key={idx} wrap={false}>
              <Text style={[styles.tableCell, { flex: 0.25 }]}>{idx + 1}</Text>
              <View style={[styles.tableCell, { flex: 3 }]}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.description && (
                  <Text style={styles.itemDescription}>
                    ({item.description})
                  </Text>
                )}
              </View>
              <Text
                style={[styles.tableCell, styles.tableCellCenter, { flex: 1 }]}
              >
                {item.warranty || "N/A"}
              </Text>
              <Text
                style={[styles.tableCell, styles.tableCellRight, { flex: 1 }]}
              >
                {formatCurrency(item.rate, false)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellCenter,
                  { flex: 0.25 },
                ]}
              >
                {item.quantity}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.tableCellRight,
                  styles.tableCellLast,
                  { flex: 1 },
                ]}
              >
                {formatCurrency(item.price, false)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={[styles.totalsBox]}>
          <View style={styles.totalsRow}>
            <Text style={{ fontWeight: "400" }}>Subtotal :</Text>
            <Text style={{ textAlign: "right" }}>
              {formatCurrency(data.subtotal)}
            </Text>
          </View>
          {data.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={{ fontWeight: "400" }}>Discount :</Text>
              <Text style={{ textAlign: "right" }}>
                - {formatCurrency(data.discount)}
              </Text>
            </View>
          )}
          <View style={{ paddingTop: 4, paddingBottom: 4 }} />
          <View style={styles.totalsRow}>
            <Text style={{ fontWeight: "400" }}>Total:</Text>
            <Text style={{ textAlign: "right" }}>
              {formatCurrency(data.total)}
            </Text>
          </View>
          <View style={{ paddingTop: 4, paddingBottom: 4 }} />
          <View style={styles.totalsRow}>
            <Text style={{ fontWeight: "400" }}>Paid:</Text>
            <Text style={{ textAlign: "right" }}>{formatCurrency(paid)}</Text>
          </View>
          {due > 0 && (
            <View style={styles.totalsRow}>
              <Text style={{ fontWeight: "400" }}>Due:</Text>
              <Text style={[styles.textDanger, { textAlign: "right" }]}>
                {formatCurrency(due)}
              </Text>
            </View>
          )}
        </View>

        {/* Amount in Words */}
        <View style={[styles.inWords, styles.sectionGap]}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>Total in Words: </Text>
            <Text style={{ textTransform: "capitalize" }}>
              {data.inWords || ""}
            </Text>
          </Text>
        </View>

        {/* Payment Details */}
        {data.payments && data.payments.length > 0 && (
          <View style={[styles.paymentTable, styles.sectionGap]}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]} fixed>
              <Text style={[styles.paymentCell, { flex: 1 }]}>
                Payment Method
              </Text>
              <Text
                style={[
                  styles.paymentCell,
                  styles.paymentCellLast,
                  { flex: 1 },
                ]}
              >
                Amount
              </Text>
            </View>
            {/* Table Body */}
            {data.payments.map((p, idx) => (
              <View style={styles.tableRow} key={idx} wrap={false}>
                <Text style={[styles.paymentCell, { flex: 1 }]}>
                  {p.method}
                </Text>
                <Text
                  style={[
                    styles.paymentCell,
                    styles.paymentCellLast,
                    { flex: 1 },
                  ]}
                >
                  {formatCurrency(Number(p.amount))}
                </Text>
              </View>
            ))}
            <View style={styles.paymentTotalBox}>
              <Text>Paid: {formatCurrency(paid)}</Text>
            </View>
          </View>
        )}

        {/* Warranty Policy Section */}
        {data.invoiceFooter && (
          <View style={[styles.warrantyBox, styles.sectionGap]}>
            <Text style={styles.warrantyTitle}>
              {data.invoiceFooterTitle || "Warranty Policy"}
            </Text>
            <Text>{data.invoiceFooter}</Text>
          </View>
        )}

        {/* Signature Section (stuck to bottom) */}
        <View style={styles.signatureSection} fixed>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Received By</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>Authorized By</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
