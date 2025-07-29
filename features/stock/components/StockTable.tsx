"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Tag } from "antd";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import { Stock } from "../types";
import MoveStockDrawer from "./MoveStockDrawer";

interface StockTableProps {
  data: Stock[];
  loading: boolean;
  onEdit?: (stock: Stock) => void;
  onDelete?: (stock: Stock) => void;
  onMoveStock?: (stock: Stock) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize?: number) => void;
  };
}

const StockTable: React.FC<StockTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onMoveStock,
  pagination,
}) => {
  const [moveDrawerOpen, setMoveDrawerOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const handleMoveStock = useCallback(
    (stock: Stock) => {
      if (stock.unit === 0) return;

      if (onMoveStock) {
        onMoveStock(stock);
      } else {
        setSelectedStock(stock);
        setMoveDrawerOpen(true);
      }
    },
    [onMoveStock],
  );

  const handleCloseMoveDrawer = useCallback(() => {
    setMoveDrawerOpen(false);
    setSelectedStock(null);
  }, []);

  const getStockStatus = useCallback((stock: Stock) => {
    const expireDate = new Date(stock.expireDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry < 0) return <Tag color="red">Expired</Tag>;
    if (daysUntilExpiry <= 30) return <Tag color="orange">Expiring Soon</Tag>;
    if (stock.unit < 10) return <Tag color="yellow">Low Stock</Tag>;
    return <Tag color="green">Good</Tag>;
  }, []);

  const columns: TableColumn<Stock>[] = useMemo(
    () => [
      {
        title: "Product",
        key: "product",
        render: (stock: Stock) => (
          <div>
            <div className="font-medium">
              {typeof stock.product === "string"
                ? stock.product
                : stock.product.name}
            </div>
            <div className="text-sm text-gray-500">
              {typeof stock.product === "string" ? "" : stock.product.barcode}
            </div>
          </div>
        ),
      },
      {
        title: "Location",
        key: "location",
        render: (stock: Stock) => (
          <div>
            <div className="font-medium">
              {typeof stock.location === "string"
                ? stock.location
                : stock.location.name}
            </div>
            <div className="text-sm text-gray-500">{stock.locationType}</div>
          </div>
        ),
      },
      {
        title: "Units",
        dataIndex: "unit",
        key: "unit",
        render: (unit: number) => (
          <span className={`font-medium ${unit < 10 ? "text-red-600" : ""}`}>
            {unit}
          </span>
        ),
      },
      {
        title: "MRP",
        dataIndex: "mrp",
        key: "mrp",
        render: (mrp: number) => `$${mrp.toFixed(2)}`,
      },
      {
        title: "TP",
        dataIndex: "tp",
        key: "tp",
        render: (tp: number) => `$${tp.toFixed(2)}`,
      },
      {
        title: "Expire Date",
        dataIndex: "expireDate",
        key: "expireDate",
        render: (expireDate: string) => {
          const date = new Date(expireDate);
          const today = new Date();
          const daysUntilExpiry = Math.ceil(
            (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          return (
            <div>
              <div className="font-medium">{date.toLocaleDateString()}</div>
              <div
                className={`text-sm ${daysUntilExpiry < 0 ? "text-red-600" : daysUntilExpiry <= 30 ? "text-orange-600" : "text-gray-500"}`}
              >
                {daysUntilExpiry < 0
                  ? "Expired"
                  : `${daysUntilExpiry} days left`}
              </div>
            </div>
          );
        },
      },
      {
        title: "Entry Date",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (createdAt: string) => new Date(createdAt).toLocaleDateString(),
      },
      {
        title: "Status",
        key: "status",
        render: (stock: Stock) => getStockStatus(stock),
      },
    ],
    [getStockStatus],
  );

  // Define actions
  const actions: TableAction<Stock>[] = useMemo(() => {
    const baseActions: TableAction<Stock>[] = [
      {
        key: "move",
        label: "Move Stock",
        icon: "ant-design:swap-outlined",
        type: "custom",
        color: "purple",
        onClick: handleMoveStock,
      },
    ];

    if (onEdit) {
      baseActions.push({
        key: "edit",
        label: "Edit",
        icon: "lineicons:pencil-1",
        type: "edit",
        color: "blue",
        onClick: onEdit,
      });
    }

    if (onDelete) {
      baseActions.push({
        key: "delete",
        label: "Delete",
        icon: "lineicons:trash-3",
        type: "delete",
        color: "red",
        onClick: onDelete,
        confirm: {
          title: "Delete Stock",
          description: "Are you sure you want to delete this stock item?",
        },
      });
    }

    return baseActions;
  }, [handleMoveStock, onEdit, onDelete]);

  return (
    <>
      <GenericTable<Stock>
        data={data}
        loading={loading}
        columns={columns}
        actions={actions}
        pagination={pagination}
        rowKey="_id"
        scroll={{ x: 1200 }}
      />

      <MoveStockDrawer
        open={moveDrawerOpen}
        onClose={handleCloseMoveDrawer}
        selectedStock={selectedStock}
      />
    </>
  );
};

export default StockTable;
