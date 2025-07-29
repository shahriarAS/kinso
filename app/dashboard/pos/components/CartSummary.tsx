"use client";

import { Input, Button, Divider, Card, Typography } from "antd";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { CartItem, CustomerOption } from "../types";
import CheckoutModal from "./CheckoutModal";

interface CartSummaryProps {
  cart: CartItem[];
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
  onSaleComplete?: (saleData: {
    outlet: string;
    customer?: string;
    paymentMethods: { method: string; amount: number }[];
    notes?: string;
  }) => void;
  outlets?: { _id: string; name: string }[];
  selectedOutlet?: string;
}

// Custom SectionHeader component
const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center my-2">
    <div className="flex-1 h-px bg-gray-200" />
    <div className="px-4 py-1 mx-3 text-xs font-semibold text-center text-gray-700 bg-gray-100 border border-gray-200 rounded-full">
      {label}
    </div>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

export default function CartSummary({
  cart,
  customer,
  discount,
  setDiscount,
  total,
  setCustomTotal,
  computedTotal,
  onCheckoutSuccess,
  onSaleComplete,
  selectedOutlet = "",
}: CartSummaryProps) {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const { error } = useNotification();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      error("Cart is empty!");
      return;
    }
    if (!customer) {
      error("Please select a customer!");
      return;
    }
    setCheckoutModalOpen(true);
  };

  return (
    <>
      <SectionHeader label="Summary" />
      <Card
        className="mb-2 border border-gray-200"
        styles={{
          body: { padding: 12 },
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <Typography.Text type="secondary">Items</Typography.Text>
            <Typography.Text className="text-base font-medium">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </Typography.Text>
          </div>
          <div className="flex justify-between">
            <Typography.Text type="secondary">Subtotal</Typography.Text>
            <Typography.Text className="text-base font-medium">
              ৳{subtotal.toFixed(2)}
            </Typography.Text>
          </div>
          <div className="flex items-center justify-between">
            <Typography.Text type="secondary">Discount</Typography.Text>
            <Input
              type="number"
              min={0}
              max={subtotal}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-20 text-right"
              size="large"
              prefix="৳"
            />
          </div>
          <div className="flex items-center justify-between">
            <Typography.Text type="secondary">Custom Total</Typography.Text>
            <Input
              type="number"
              min={0}
              value={total !== computedTotal ? total : ""}
              onChange={(e) => setCustomTotal(e.target.value)}
              placeholder={computedTotal.toFixed(2)}
              className="w-20 text-right"
              size="large"
              prefix="৳"
            />
          </div>
          <Divider className="my-1" />
          <div className="flex items-center justify-between">
            <Typography.Text strong className="text-lg">
              Total
            </Typography.Text>
            <Typography.Text strong className="text-lg text-green-600">
              ৳{total.toFixed(2)}
            </Typography.Text>
          </div>
        </div>
      </Card>
      <Button
        type="primary"
        size="large"
        className="w-full font-semibold rounded-xl"
        onClick={handleCheckout}
        disabled={cart.length === 0 || !customer}
        icon={<Icon icon="mdi:cash-register" className="text-xl" />}
      >
        Complete Sale
      </Button>

      <CheckoutModal
        open={checkoutModalOpen}
        onCancel={() => setCheckoutModalOpen(false)}
        cart={cart}
        customer={customer}
        discount={discount}
        total={total}
        selectedOutlet={selectedOutlet}
        onCheckoutSuccess={onCheckoutSuccess}
        onSaleComplete={onSaleComplete}
      />
    </>
  );
}
