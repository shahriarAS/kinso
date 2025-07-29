"use client";

import { Input, Button, Tooltip, Typography, Card } from "antd";
import { Icon } from "@iconify/react";
import { CartItem } from "../types";

interface CartItemsProps {
  cart: CartItem[];
  onQty: (stock: string, qty: number) => void;
  onRemove: (stock: string) => void;
  onPrice: (stock: string, price: number) => void;
}

// Custom SectionHeader component
const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center my-2">
    <div className="flex-1 h-px bg-gray-200" />
    <div className="mx-3 px-4 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 text-center border border-gray-200">
      {label}
    </div>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

export default function CartItems({
  cart,
  onQty,
  onRemove,
  onPrice,
}: CartItemsProps) {
  return (
    <>
      <SectionHeader label="Cart Items" />
      <Card
        className="border border-gray-200 mb-2"
        styles={{
          body: { padding: 12, minHeight: 120 },
        }}
      >
        {cart.length === 0 ? (
          <div className="text-gray-400 text-center py-4">No items in cart</div>
        ) : (
          cart.map((item) => {
            const maxQty = item.availableStock;
            return (
              <div
                key={item.stock}
                className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0 gap-2 hover:bg-gray-100 rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-2 w-[40%]">
                  <div>
                    <Typography.Text
                      strong
                      className="text-primary text-sm line-clamp-2"
                    >
                      {item.name}
                    </Typography.Text>
                    <div className="text-xs text-gray-600">Barcode: {item.barcode || 'N/A'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-[60%]">
                  <div className="flex items-center gap-1">
                    <Button
                      size="small"
                      shape="circle"
                      onClick={() => onQty(item.stock, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="border-gray-300"
                    >
                      <Icon icon="mdi:minus" />
                    </Button>
                    <span className="w-7 text-center font-semibold text-base">
                      {item.quantity}
                    </span>
                    <Button
                      size="small"
                      shape="circle"
                      onClick={() => onQty(item.stock, item.quantity + 1)}
                      disabled={item.quantity >= maxQty}
                      className="border-gray-300"
                    >
                      <Icon icon="mdi:plus" />
                    </Button>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={item.price}
                    size="middle"
                    className="w-36 text-right font-semibold text-green-600"
                    onChange={(e) => onPrice(item.stock, Number(e.target.value))}
                    prefix="৳"
                    style={{ textAlign: "right" }}
                  />
                  <Typography.Text className="font-semibold text-green-700 text-sm w-20 text-right">
                    ৳{item.price * item.quantity}
                  </Typography.Text>
                  <Tooltip title="Remove">
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => onRemove(item.stock)}
                      icon={<Icon icon="lineicons:close" />}
                    />
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
      </Card>
    </>
  );
}
