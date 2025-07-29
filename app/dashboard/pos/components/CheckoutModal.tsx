"use client";

import { Input, Select, Button, Modal, Divider, Card, Typography } from "antd";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { CartItem } from "../types";
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_METHOD_ICONS,
} from "@/lib/constraints";

interface CheckoutModalProps {
  open: boolean;
  onCancel: () => void;
  cart: CartItem[];
  customer: string;
  discount: number;
  total: number;
  selectedOutlet: string;
  onCheckoutSuccess: () => void;
  onSaleComplete?: (saleData: {
    outlet: string;
    customer?: string;
    paymentMethods: { method: string; amount: number }[];
    notes?: string;
  }) => void;
}

export default function CheckoutModal({
  open,
  onCancel,
  cart,
  customer,
  discount,
  total,
  selectedOutlet,
  onCheckoutSuccess,
  onSaleComplete,
}: CheckoutModalProps) {
  const [payments, setPayments] = useState([{ method: "CASH", amount: 0 }]);
  const [notes, setNotes] = useState("");
  const { success, error } = useNotification();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const due = Math.max(0, total - paid);

  const confirmCheckout = async () => {
    try {
      if (onSaleComplete) {
        onSaleComplete({
          outlet: selectedOutlet,
          customer: customer || undefined,
          paymentMethods: payments,
          notes:
            notes ||
            (discount > 0 ? `Discount applied: ৳${discount}` : undefined),
        });
      }

      success("Sale completed successfully!");
      onCancel();
      onCheckoutSuccess();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      error("Failed to complete sale", err?.message);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Icon icon="mdi:cash-register" className="text-xl text-primary" />
          <span>Complete Sale</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      destroyOnHidden={true}
      footer={null}
      width={600}
      className="checkout-modal"
    >
      <div className="space-y-6">
        {/* Sale Summary */}
        <Card size="small" className="border-none bg-gray-50">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="font-semibold text-red-600">
                -৳{discount.toFixed(2)}
              </span>
            </div>
            <Divider className="my-2" />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-green-600">
                ৳{total.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Payment Methods */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Typography.Title level={5} className="!mb-0">
              Payment Methods
            </Typography.Title>
            <Button
              type="dashed"
              size="small"
              onClick={() =>
                setPayments([...payments, { method: "CASH", amount: 0 }])
              }
              icon={<Icon icon="mdi:plus" />}
            >
              Add Payment
            </Button>
          </div>

          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <Select
                  value={payment.method}
                  onChange={(value) => {
                    const newPayments = [...payments];
                    newPayments[index].method = value;
                    setPayments(newPayments);
                  }}
                  className="flex-1"
                  options={PAYMENT_METHOD_OPTIONS.map((method) => ({
                    label: (
                      <span className="flex items-center gap-2">
                        <Icon icon={PAYMENT_METHOD_ICONS[method.value]} />
                        {method.label}
                      </span>
                    ),
                    value: method.value,
                  }))}
                />
                <Input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => {
                    const newPayments = [...payments];
                    const newAmount = Number(e.target.value);
                    const otherPaymentsTotal = payments
                      .filter((_, i) => i !== index)
                      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                    const maxAllowed = total - otherPaymentsTotal;
                    newPayments[index].amount = Math.min(
                      newAmount,
                      maxAllowed,
                    );
                    setPayments(newPayments);
                  }}
                  placeholder="Amount"
                  prefix="৳"
                  className="w-32"
                  min={0}
                  max={total}
                  step={0.01}
                />
                {payments.length > 1 && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<Icon icon="mdi:close" />}
                    onClick={() =>
                      setPayments(payments.filter((_, i) => i !== index))
                    }
                  />
                )}
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <Card size="small" className="mt-3 border-blue-200 bg-blue-50">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-semibold">৳{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Paid:</span>
                <span className="font-semibold">৳{paid.toFixed(2)}</span>
              </div>
              {due > 0 && (
                <div className="flex justify-between pt-1 text-sm border-t border-blue-200">
                  <span>Due:</span>
                  <span className="font-semibold text-red-600">
                    ৳{due.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Notes */}
        <div>
          <Typography.Text strong className="block mb-2">
            Notes (optional)
          </Typography.Text>
          <Input.TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for this sale..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            size="large"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={confirmCheckout}
            className="flex-1"
            icon={<Icon icon="mdi:check" />}
          >
            Complete Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
}
