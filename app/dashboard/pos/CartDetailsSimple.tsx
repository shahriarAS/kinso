"use client";

import {
  Input,
  Select,
  Button,
  Card,
  Typography,
  Modal,
} from "antd";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { CartItem, CustomerOption } from "./types";
import { PAYMENT_METHODS } from "@/lib/constraints";
import { UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface CartDetailsProps {
  cart: CartItem[];
  onQty: (stockId: string, qty: number) => void;
  onRemove: (stockId: string) => void;
  onPrice: (stockId: string, price: number) => void;
  customer: string;
  setCustomer: (v: string) => void;
  discount: number;
  setDiscount: (v: number) => void;
  total: number;
  setCustomTotal: (v: string) => void;
  computedTotal: number;
  customers: CustomerOption[];
  onCreateCustomer: () => void;
  onCheckoutSuccess: () => void;
  selectedWarehouse: string;
  onSaleComplete?: (saleData: {
    outletId: string;
    customerId?: string;
    paymentMethod: string;
    notes?: string;
  }) => void;
  outlets?: { _id: string; name: string }[];
  selectedOutlet?: string;
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
  customers,
  onCreateCustomer,
  onCheckoutSuccess,
  selectedWarehouse,
  onSaleComplete,
  outlets = [],
  selectedOutlet = "",
}: CartDetailsProps) {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");
  const { success, error } = useNotification();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      error("Cart is empty!");
      return;
    }
    setCheckoutModalOpen(true);
  };

  const confirmCheckout = () => {
    if (onSaleComplete) {
      onSaleComplete({
        outletId: selectedOutlet,
        customerId: customer || undefined,
        paymentMethod,
        notes: notes || (discount > 0 ? `Discount applied: ৳${discount}` : undefined),
      });
    }
    setCheckoutModalOpen(false);
  };

  return (
    <>
      <Card
        className="border-none shadow-md mb-2"
        styles={{
          body: { padding: 16 },
        }}
      >
        <div className="flex items-center mb-2">
          <UserOutlined className="text-primary text-lg mr-2" />
          <Title level={5} className="!mb-0">
            Bill Details
          </Title>
          <span className="ml-auto text-xs text-gray-400 font-normal">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-2">
          <Select
            options={customers}
            value={customer}
            onChange={setCustomer}
            className="flex-1 rounded-3xl"
            size="large"
            placeholder="Select Customer"
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <Button
            type="primary"
            size="large"
            onClick={onCreateCustomer}
            icon={<Icon icon="mdi:account-plus" />}
          />
        </div>
      </Card>

      <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col gap-3 shadow-lg min-h-[500px] overflow-hidden relative">
        <div className="font-semibold text-xl text-primary flex justify-between items-center">
          <span>Cart Items</span>
          <span className="text-sm text-gray-400 font-normal">
            {cart.length} item{cart.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[300px]">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon icon="mdi:cart-outline" className="text-4xl mb-2" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.stockId}
                className="flex items-center justify-between border-b border-gray-100 py-4 gap-4 bg-white/80 rounded-xl px-2"
              >
                <div className="flex items-center gap-3 w-1/3">
                  <div>
                    <div className="font-medium text-sm text-primary truncate max-w-[120px]">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Stock: {item.availableStock}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-2/3">
                  <Button
                    size="small"
                    shape="circle"
                    icon={<Icon icon="mdi:minus" />}
                    onClick={() => onQty(item.stockId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  />
                  <span className="w-7 text-center font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    size="small"
                    shape="circle"
                    icon={<Icon icon="mdi:plus" />}
                    onClick={() => onQty(item.stockId, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock}
                  />
                  <Input
                    size="small"
                    type="number"
                    value={item.price}
                    onChange={(e) => onPrice(item.stockId, Number(e.target.value))}
                    className="w-16"
                    min={0}
                    step={0.01}
                  />
                  <span className="text-sm font-medium text-green-600 w-12 text-right">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    size="small"
                    shape="circle"
                    danger
                    icon={<Icon icon="mdi:trash-can" />}
                    onClick={() => onRemove(item.stockId)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary */}
        <div className="pt-4 border-t border-gray-200 text-sm flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>৳{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Discount:</span>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-20 text-right"
              size="small"
              min={0}
              max={subtotal}
            />
          </div>
          <div className="flex justify-between items-center">
            <span>Custom Total:</span>
            <Input
              type="number"
              value={total !== computedTotal ? total : ""}
              onChange={(e) => setCustomTotal(e.target.value)}
              placeholder={computedTotal.toFixed(2)}
              className="w-20 text-right"
              size="small"
              min={0}
            />
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 items-center">
            <span>Total:</span>
            <span className="text-green-600">৳{total.toFixed(2)}</span>
          </div>
          <Button
            type="primary"
            size="large"
            className="w-full mt-4 rounded-xl"
            onClick={handleCheckout}
            disabled={cart.length === 0 || total <= 0}
            icon={<Icon icon="mdi:cash-register" />}
          >
            Complete Sale
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal
        title="Complete Sale"
        open={checkoutModalOpen}
        onCancel={() => setCheckoutModalOpen(false)}
        onOk={confirmCheckout}
        okText="Complete Sale"
        width={500}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <Select
              value={paymentMethod}
              onChange={setPaymentMethod}
              className="w-full"
              options={PAYMENT_METHODS.map(method => ({
                label: method,
                value: method,
              }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <Input.TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this sale..."
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="text-lg font-bold text-green-600">৳{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
