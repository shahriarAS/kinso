"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button, Modal, Spin, Alert } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SwapOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import {
  useGetStocksQuery,
  useDeleteStockMutation,
} from "@/features/stock/api";
import {
  AddEditStockDrawer,
  StockTable,
  StockFilters,
} from "@/features/stock/components";
import MoveStockDrawer from "@/features/stock/components/MoveStockDrawer";
import type { Stock } from "@/features/stock/types";

interface StockFiltersType {
  page?: number;
  limit?: number;
  location?: string;
  locationType?: string;
  product?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export default function StockPage() {
  const [filters, setFilters] = useState<StockFiltersType>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [moveDrawerOpen, setMoveDrawerOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showStats, setShowStats] = useState(true);

  // API hooks
  const {
    data: stockData,
    isLoading: stockLoading,
    isError: stockError,
    refetch: refetchStock,
  } = useGetStocksQuery({
    ...filters,
    page,
    limit,
  });

  const [deleteStock, { isLoading: deleteLoading }] = useDeleteStockMutation();

  // Memoized calculations
  const stockStats = useMemo(() => {
    if (!stockData?.data) return null;

    const stocks = stockData.data;
    const totalStock = stocks.reduce(
      (sum: number, stock: Stock) => sum + stock.unit,
      0,
    );
    const totalValue = stocks.reduce(
      (sum: number, stock: Stock) => sum + stock.mrp * stock.unit,
      0,
    );
    const lowStockItems = stocks.filter(
      (stock: Stock) => stock.unit < 10,
    ).length;

    const today = new Date();
    const expiringItems = stocks.filter((stock: Stock) => {
      const expireDate = new Date(stock.expireDate);
      const daysUntilExpiry = Math.ceil(
        (expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
    }).length;

    return {
      totalStock,
      totalValue,
      lowStockItems,
      expiringItems,
      stockByLocation: {
        warehouse: {},
        outlet: {},
      },
    };
  }, [stockData?.data]);

  const handleFiltersChange = useCallback((newFilters: StockFiltersType) => {
    setFilters((prevFilters: StockFiltersType) => ({
      ...prevFilters,
      ...newFilters,
    }));
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
    setPage(1);
    toast.success("Filters reset successfully");
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refetchStock();
      toast.success("Stock data refreshed successfully");
    } catch {
      toast.error("Failed to refresh stock data");
    }
  }, [refetchStock]);

  const handleMoveStock = useCallback((stock: Stock) => {
    setSelectedStock(stock);
    setMoveDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((stock: Stock) => {
    setEditingStock(stock);
    setEditDrawerOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (stock: Stock) => {
      const productName =
        typeof stock.product === "string" ? stock.product : stock.product.name;

      Modal.confirm({
        title: "Delete Stock Entry",
        content: (
          <div>
            <p>Are you sure you want to delete this stock entry?</p>
            <div className="p-3 mt-2 rounded bg-gray-50">
              <strong>Product:</strong> {productName}
              <br />
              <strong>Location:</strong>{" "}
              {typeof stock.location === "string"
                ? stock.location
                : stock.location.name}
              <br />
              <strong>Units:</strong> {stock.unit}
            </div>
            <p className="mt-2 text-red-600">This action cannot be undone.</p>
          </div>
        ),
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "Cancel",
        okButtonProps: { loading: deleteLoading },
        onOk: async () => {
          try {
            await deleteStock(stock._id).unwrap();
            toast.success("Stock deleted successfully");
            refetchStock();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete stock");
          }
        },
      });
    },
    [deleteStock, deleteLoading, refetchStock],
  );

  const toggleStats = useCallback(() => {
    setShowStats((prev) => !prev);
  }, []);

  const handleCloseAddDrawer = useCallback(() => {
    setAddDrawerOpen(false);
  }, []);

  const handleCloseEditDrawer = useCallback(() => {
    setEditDrawerOpen(false);
    setEditingStock(null);
  }, []);

  const handleCloseMoveDrawer = useCallback(() => {
    setMoveDrawerOpen(false);
    setSelectedStock(null);
  }, []);

  // Loading state
  if (stockLoading && !stockData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (stockError) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          <Alert
            message="Error Loading Stock Data"
            description="There was an error loading the stock data. Please try refreshing the page."
            type="error"
            showIcon
            action={
              <Button size="small" danger onClick={handleRefresh}>
                Retry
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Stock Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage inventory across warehouses and outlets with real-time
                tracking
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                icon={<BarChartOutlined />}
                onClick={toggleStats}
                type={showStats ? "primary" : "default"}
                size="large"
              >
                {showStats ? "Hide Stats" : "Show Stats"}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={stockLoading}
                size="large"
              >
                Refresh
              </Button>
              <Button
                icon={<SwapOutlined />}
                onClick={() => setMoveDrawerOpen(true)}
                size="large"
                disabled={!stockData?.data?.length}
              >
                Transfer Stock
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setAddDrawerOpen(true)}
                size="large"
              >
                Add Stock
              </Button>
            </div>
          </div>
        </div>

        {/* Stock Statistics */}
        {showStats && stockStats && (
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <BarChartOutlined className="w-4 h-4" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Stock
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stockStats.totalStock.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <span className="font-semibold text-green-600">৳</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Value
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ৳{stockStats.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stockStats.lowStockItems > 0
                        ? "bg-yellow-100"
                        : "bg-green-100"
                    }`}
                  >
                    <span
                      className={`font-semibold ${
                        stockStats.lowStockItems > 0
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      !
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Low Stock Items
                  </p>
                  <p
                    className={`text-2xl font-semibold ${
                      stockStats.lowStockItems > 0
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {stockStats.lowStockItems}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stockStats.expiringItems > 0
                        ? "bg-red-100"
                        : "bg-green-100"
                    }`}
                  >
                    <span
                      className={`font-semibold ${
                        stockStats.expiringItems > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ⏰
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Expiring Soon
                  </p>
                  <p
                    className={`text-2xl font-semibold ${
                      stockStats.expiringItems > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {stockStats.expiringItems}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <StockFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        <StockTable
          data={stockData?.data || []}
          loading={stockLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onMoveStock={handleMoveStock}
          pagination={
            stockData?.pagination
              ? {
                  current: page,
                  pageSize: limit,
                  total: stockData.pagination.total,
                  onChange: (newPage, newPageSize) => {
                    setPage(newPage);
                    if (newPageSize) setLimit(newPageSize);
                  },
                }
              : undefined
          }
        />
      </div>

      {/* Drawers */}
      <AddEditStockDrawer open={addDrawerOpen} onClose={handleCloseAddDrawer} />

      <AddEditStockDrawer
        open={editDrawerOpen}
        onClose={handleCloseEditDrawer}
        stock={editingStock}
      />

      <MoveStockDrawer
        open={moveDrawerOpen}
        onClose={handleCloseMoveDrawer}
        selectedStock={selectedStock}
      />
    </div>
  );
}
