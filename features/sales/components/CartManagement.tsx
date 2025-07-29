"use client";

import React from "react";
import { Table, InputNumber, Button, Space, Typography, Card } from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { CartItem } from "@/app/dashboard/pos/types";

const { Text, Title } = Typography;

interface CartManagementProps {
  cart: CartItem[];
  onQuantityChange: (stockId: string, quantity: number) => void;
  onDiscountChange: (stockId: string, discount: number) => void;
  onRemoveItem: (stockId: string) => void;
  onClearCart: () => void;
}

const CartManagement: React.FC<CartManagementProps> = ({
  cart,
  onQuantityChange,
  onDiscountChange,
  onRemoveItem,
  onClearCart,
}) => {
  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "productName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) => (
        <Text>৳{price.toFixed(2)}</Text>
      ),
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (_: any, record: CartItem) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<MinusOutlined />}
            onClick={() => {
              if (record.quantity > 1) {
                onQuantityChange(record.stockId, record.quantity - 1);
              }
            }}
            disabled={record.quantity <= 1}
          />
          <InputNumber
            size="small"
            min={1}
            max={record.availableStock}
            value={record.quantity}
            onChange={(value) => onQuantityChange(record.stockId, value || 1)}
            style={{ width: 60 }}
          />
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              if (record.quantity < record.availableStock) {
                onQuantityChange(record.stockId, record.quantity + 1);
              }
            }}
            disabled={record.quantity >= record.availableStock}
          />
        </Space>
      ),
    },
    {
      title: "Discount",
      key: "discount",
      render: (_: any, record: CartItem) => (
        <InputNumber
          size="small"
          min={0}
          max={record.unitPrice * record.quantity}
          value={record.discountApplied}
          onChange={(value) => onDiscountChange(record.stockId, value || 0)}
          formatter={(value) => `৳${value}`}
          parser={(value) => Number(value!.replace(/৳\s?|(,*)/g, ""))}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: "Total",
      key: "total",
      render: (_: any, record: CartItem) => (
        <Text strong>৳{record.totalPrice.toFixed(2)}</Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemoveItem(record.stockId)}
          size="small"
        />
      ),
    },
  ];

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discountApplied, 0);
  const finalTotal = subtotal - totalDiscount;

  return (
    <Card title="Cart Items" className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <Table
            dataSource={cart}
            columns={columns}
            rowKey="stockId"
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text>Subtotal:</Text>
              <Text>৳{subtotal.toFixed(2)}</Text>
            </div>
            <div className="flex justify-between">
              <Text>Total Discount:</Text>
              <Text type="danger">-৳{totalDiscount.toFixed(2)}</Text>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <Title level={4} style={{ margin: 0 }}>Total:</Title>
              <Title level={4} style={{ margin: 0 }}>৳{finalTotal.toFixed(2)}</Title>
            </div>
          </div>
          
          {cart.length > 0 && (
            <Button
              danger
              onClick={onClearCart}
              className="w-full mt-4"
            >
              Clear Cart
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CartManagement; 