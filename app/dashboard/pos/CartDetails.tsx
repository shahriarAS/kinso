"use client";

import { Input, Select, Button, Tooltip } from "antd";
import { Icon } from "@iconify/react";
import { CartItem, customers } from "./types";
import { getInitials } from "./page";

interface CartDetailsProps {
  cart: CartItem[];
  onQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onPrice: (id: string, price: number) => void;
  customer: string;
  setCustomer: (v: string) => void;
  discount: number;
  setDiscount: (v: number) => void;
  total: number;
  setCustomTotal: (v: string) => void;
  computedTotal: number;
}

export default function CartDetails({
  cart,
  onQty,
  onRemove,
  onPrice,
  customer,
  setCustomer,
  discount,
  setDiscount,
  total,
  setCustomTotal,
  computedTotal,
}: CartDetailsProps) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.05;
  const shipping = cart.length > 0 ? 60 : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col gap-3 shadow-lg min-h-[500px] overflow-hidden relative">
      <div className="font-semibold text-xl text-primary flex justify-between items-center mb-1">
        Bill Details
        <span className="text-xs text-gray-400 font-normal">
          {new Date().toLocaleDateString()}
        </span>
      </div>
      <Select
        options={customers}
        value={customer}
        onChange={setCustomer}
        className="mb-1"
        size="large"
        placeholder="Select Customer"
        popupClassName="rounded-xl"
      />
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
        {cart.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No items in cart</div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0 gap-4 bg-white/80 rounded-xl px-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-bold text-primary/60 border border-gray-200">
                  {getInitials(item.name)}
                </div>
                <div>
                  <div className="font-medium text-primary text-sm line-clamp-1">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-400">UPC: {item.upc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  shape="circle"
                  onClick={() => onQty(item.id, item.quantity - 1)}
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
                  onClick={() => onQty(item.id, item.quantity + 1)}
                  className="border-gray-300"
                >
                  <Icon icon="mdi:plus" />
                </Button>
              </div>
              <Input
                type="number"
                min={0}
                value={item.price}
                size="small"
                className="w-20 text-right font-semibold text-green-600"
                onChange={(e) => onPrice(item.id, Number(e.target.value))}
                prefix="$"
                style={{ textAlign: "right" }}
              />
              <span className="font-semibold text-green-700 text-base w-20 text-right">
                ${item.price * item.quantity}
              </span>
              <Tooltip title="Remove">
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={() => onRemove(item.id)}
                  icon={<Icon icon="lineicons:close" />}
                />
              </Tooltip>
            </div>
          ))
        )}
      </div>
      {/* Cart summary */}
      <div className="pt-4 border-t border-gray-200 text-sm flex flex-col gap-1">
        <div className="flex justify-between">
          <span className="text-gray-500">Items</span>
          <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span>${subtotal}</span>
        </div>
        {/* <div className="flex justify-between">
          <span className="text-gray-500">Tax (5%)</span>
          <span>${tax}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span>${shipping}</span>
        </div> */}
        <div className="flex justify-between text-red-500 items-center">
          <span>Discount</span>
          <Input
            type="number"
            min={0}
            value={discount}
            size="small"
            className="w-20 text-right font-semibold"
            onChange={(e) => setDiscount(Number(e.target.value))}
            prefix="$"
            style={{ textAlign: "right" }}
          />
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 items-center">
          <span>Total</span>
          <Input
            type="number"
            min={0}
            value={total}
            size="small"
            className="w-24 text-right font-bold text-green-700"
            onChange={(e) => setCustomTotal(e.target.value)}
            prefix="$"
            style={{ textAlign: "right" }}
            placeholder={computedTotal.toString()}
          />
        </div>
        <Button
          size="large"
          type="primary"
          className="w-full mt-4 !bg-primary hover:!bg-primary/90 !border-primary text-lg font-semibold py-2 rounded-xl transition-all"
        >
          Checkout
        </Button>
      </div>
    </div>
  );
} 