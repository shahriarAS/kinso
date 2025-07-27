"use client";

import React, { useState, useCallback } from "react";
import { Button, message, Modal } from "antd";
import { PlusOutlined, ReloadOutlined, SwapOutlined } from "@ant-design/icons";
import { toast } from "react-hot-toast";
import {
  useGetStocksQuery,
  useGetStockStatsQuery,
  AddStockDrawer,
  StockTable,
  StockFilters,
  StockStats,
} from "@/features/stock";
import MoveStockDrawer from "@/features/stock/components/MoveStockDrawer";
import { StockFilters as StockFiltersType } from "@/features/stock/types";
import type { Stock } from "@/features/stock/types";

export default function StockPage() {
  const [filters, setFilters] = useState<StockFiltersType>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [moveDrawerOpen, setMoveDrawerOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const {
    data: stockData,
    isLoading: stockLoading,
    refetch: refetchStock,
  } = useGetStocksQuery({
    ...filters,
    page,
    limit,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useGetStockStatsQuery({});

  const handleFiltersChange = useCallback((newFilters: StockFiltersType) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleTableChange = useCallback((pagination: any) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchStock();
    refetchStats();
    toast.success("Stock data refreshed");
  }, [refetchStock, refetchStats]);

  const handleAddSuccess = useCallback(() => {
    refetchStock();
    refetchStats();
    toast.success("Stock added successfully");
  }, [refetchStock, refetchStats]);

  const handleMoveStock = useCallback((stock: Stock) => {
    setSelectedStock(stock);
    setMoveDrawerOpen(true);
  }, []);

  const handleMoveSuccess = useCallback(() => {
    refetchStock();
    refetchStats();
    toast.success("Stock transferred successfully");
  }, [refetchStock, refetchStats]);

  const handleEdit = useCallback((stock: Stock) => {
    message.info("Edit functionality coming soon");
  }, []);

  const handleDelete = useCallback((stock: Stock) => {
    Modal.confirm({
      title: "Delete Stock",
      content: `Are you sure you want to delete this stock entry for ${stock.productId}?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        message.info("Delete functionality coming soon");
      },
    });
  }, []);

  const handleCloseMoveDrawer = useCallback(() => {
    setMoveDrawerOpen(false);
    setSelectedStock(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
              <p className="text-gray-600 mt-2">
                Manage inventory across warehouses and outlets with FIFO tracking
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={stockLoading || statsLoading}
              >
                Refresh
              </Button>
              <Button
                icon={<SwapOutlined />}
                onClick={() => setMoveDrawerOpen(true)}
                size="large"
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

        {/* Statistics */}
        {statsData?.data && (
          <StockStats stats={statsData.data} loading={statsLoading} />
        )}

        {/* Filters */}
        <StockFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Stock Inventory</h2>
            <p className="text-gray-600 mt-1">
              Showing {stockData?.data?.length || 0} of {stockData?.pagination?.total || 0} stock entries
            </p>
          </div>
          
          <StockTable
            data={stockData?.data || []}
            loading={stockLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          
          {/* Pagination */}
          {stockData?.pagination && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, stockData.pagination.total)} of {stockData.pagination.total} entries
                </div>
                <div className="text-sm text-gray-600">
                  Page {page} of {Math.ceil(stockData.pagination.total / limit)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Stock Drawer */}
      <AddStockDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
      />

      {/* Move Stock Drawer */}
      <MoveStockDrawer
        open={moveDrawerOpen}
        onClose={handleCloseMoveDrawer}
        selectedStock={selectedStock}
      />
    </div>
  );
} 