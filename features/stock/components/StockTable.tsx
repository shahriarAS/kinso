import React, { useState } from "react";
import { Table, Button, Tag, Space, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, SwapOutlined } from "@ant-design/icons";
import { Stock } from "../types";
import MoveStockDrawer from "./MoveStockDrawer";

interface StockTableProps {
  data: Stock[];
  loading: boolean;
  onEdit?: (stock: Stock) => void;
  onDelete?: (stock: Stock) => void;
}

const StockTable: React.FC<StockTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
}) => {
  const [moveDrawerOpen, setMoveDrawerOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const handleMoveStock = (stock: Stock) => {
    setSelectedStock(stock);
    setMoveDrawerOpen(true);
  };

  const handleCloseMoveDrawer = () => {
    setMoveDrawerOpen(false);
    setSelectedStock(null);
  };

  const getStockStatus = (stock: Stock) => {
    const expireDate = new Date(stock.expireDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return <Tag color="red">Expired</Tag>;
    } else if (daysUntilExpiry <= 30) {
      return <Tag color="orange">Expiring Soon</Tag>;
    } else if (stock.units < 10) {
      return <Tag color="yellow">Low Stock</Tag>;
    } else {
      return <Tag color="green">Good</Tag>;
    }
  };

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (stock: Stock) => (
        <div>
          <div className="font-medium">{stock.product?.name}</div>
          <div className="text-sm text-gray-500">{stock.product?.barcode}</div>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (stock: Stock) => (
        <div>
          <div className="font-medium">
            {stock.outlet?.name || stock.warehouse?.name}
          </div>
          <div className="text-sm text-gray-500">
            {stock.outlet ? "Outlet" : "Warehouse"}
          </div>
        </div>
      ),
    },
    {
      title: "Units",
      dataIndex: "units",
      key: "units",
      render: (units: number) => (
        <span className={`font-medium ${units < 10 ? "text-red-600" : ""}`}>
          {units}
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
        const daysUntilExpiry = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        return (
          <div>
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className={`text-sm ${daysUntilExpiry < 0 ? "text-red-600" : daysUntilExpiry <= 30 ? "text-orange-600" : "text-gray-500"}`}>
              {daysUntilExpiry < 0 ? "Expired" : `${daysUntilExpiry} days left`}
            </div>
          </div>
        );
      },
    },
    {
      title: "Entry Date",
      dataIndex: "entryDate",
      key: "entryDate",
      render: (entryDate: string) => new Date(entryDate).toLocaleDateString(),
    },
    {
      title: "Status",
      key: "status",
      render: (stock: Stock) => getStockStatus(stock),
    },
    {
      title: "Actions",
      key: "actions",
      render: (stock: Stock) => (
        <Space>
          <Tooltip title="Move Stock">
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => handleMoveStock(stock)}
              disabled={stock.units === 0}
            />
          </Tooltip>
          {onEdit && (
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(stock)}
              />
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(stock)}
                danger
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="_id"
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{ x: 1200 }}
      />

      <MoveStockDrawer
        open={moveDrawerOpen}
        onClose={handleCloseMoveDrawer}
        stock={selectedStock}
      />
    </>
  );
};

export default StockTable; 