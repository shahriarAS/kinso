"use client";

import { useState, useCallback } from "react";
import { Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { salesApi } from "@/features/sales";
import ViewSaleDrawer from "@/features/sales/components/ViewSaleDrawer";
import { outletsApi } from "@/features/outlets";
import { customersApi } from "@/features/customers";
import type { SalesHistoryFilters } from "@/features/sales";
import { pdf } from "@react-pdf/renderer";
import { useGetSettingsQuery } from "@/features/settings/api";
import { useFetchAuthUserQuery } from "@/features/auth";
import InvoicePDF from "@/components/common/InvoicePDF";
import { mapSaleToInvoiceData } from "@/lib/invoiceUtils";
import toast from "react-hot-toast";
import { SalesFilters, SalesTable } from "./components";

export default function SalesHistoryPage() {
  const [filters, setFilters] = useState<SalesHistoryFilters>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [outletFilter, setOutletFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const { data: salesData, isLoading, refetch } = salesApi.useGetSalesHistoryQuery(filters);
  const { data: outletsData } = outletsApi.useGetOutletsQuery({ limit: 100 });
  const { data: customersData } = customersApi.useGetCustomersQuery({ limit: 100 });
  const { data: settingsData } = useGetSettingsQuery();
  const { data: userData } = useFetchAuthUserQuery();

  // Download invoice PDF function
  const downloadInvoicePDF = useCallback(
    async (saleId: string) => {
      if (!saleId || !settingsData) {
        toast.error("Sale ID or settings not found");
        return;
      }
      try {
        // Fetch sale data directly from API
        const response = await fetch(`/api/sales/${saleId}`);
        const saleRes = await response.json();
        if (!saleRes?.data) {
          toast.error("Sale not found");
          return;
        }
        const invoiceData = mapSaleToInvoiceData(
          saleRes.data,
          settingsData.data,
          userData?.user?.name,
        );
        const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        toast.success("Invoice downloaded successfully!");
      } catch (err) {
        toast.error("Failed to download Invoice");
        console.error("Failed to download PDF", err);
      }
    },
    [settingsData, userData]
  );

  const handleFilterChange = (key: keyof SalesHistoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setFilters(prev => ({
        ...prev,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
        page: 1,
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
        page: 1,
      }));
    }
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setFilters(prev => ({
      ...prev,
      page,
      limit: pageSize,
    }));
  };

  const handleViewSale = (saleId: string) => {
    setSelectedSaleId(saleId);
    setViewDrawerOpen(true);
  };

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-primary">Sales History</h1>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => refetch()}
          loading={isLoading}
          size="large"
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <SalesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        paymentMethodFilter={paymentMethodFilter}
        setPaymentMethodFilter={setPaymentMethodFilter}
        outletFilter={outletFilter}
        setOutletFilter={setOutletFilter}
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
        outletsData={outletsData}
      />

      {/* Table */}
      <SalesTable
        salesData={salesData}
        isLoading={isLoading}
        currentPage={currentPage}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        onViewSale={handleViewSale}
        onDownloadInvoice={downloadInvoicePDF}
      />

      {/* View Sale Drawer */}
      <ViewSaleDrawer
        open={viewDrawerOpen}
        onClose={() => {
          setViewDrawerOpen(false);
          setSelectedSaleId(null);
        }}
        saleId={selectedSaleId}
      />
    </div>
  );
} 