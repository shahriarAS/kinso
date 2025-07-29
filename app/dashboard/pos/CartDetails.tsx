"use client";

import {
  Input,
  Select,
  Button,
  Tooltip,
  Modal,
  Divider,
  Card,
  Typography,
} from "antd";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { CartItem, CustomerOption } from "./types";
import { PAYMENT_METHOD_OPTIONS, PAYMENT_METHOD_ICONS } from "@/lib/constraints";
import { UserOutlined } from "@ant-design/icons";

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
  onSaleComplete?: (saleData: {
    outletId: string;
    customerId?: string;
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
    <div className="mx-3 px-4 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700 text-center shadow-sm">
      {label}
    </div>
    <div className="flex-1 h-px bg-gray-200" />
  </div>
);

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
  onSaleComplete,
  outlets = [],
  selectedOutlet = "",
}: CartDetailsProps) {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [payments, setPayments] = useState([{ method: "CASH", amount: 0 }]);
  const [notes, setNotes] = useState("");
  const { success, error } = useNotification();

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const paid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const due = Math.max(0, total - paid);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      error("Cart is empty!");
      return;
    }
    if (!customer) {
      error("Please select a customer!");
      return;
    }
    if (paid > total) {
      error("Total paid cannot exceed total amount.");
      return;
    }
    setCheckoutModalOpen(true);
  };

  const confirmCheckout = async () => {
    try {
      const selectedCustomer = customers.find((c) => c.value === customer);

      if (onSaleComplete) {
        onSaleComplete({
          outletId: selectedOutlet,
          customerId: customer || undefined,
          paymentMethods: payments,
          notes: notes || (discount > 0 ? `Discount applied: ৳${discount}` : undefined),
        });
      }
      
      success("Sale completed successfully!");
      setCheckoutModalOpen(false);
      onCheckoutSuccess();
    } catch (err: any) {
      error("Failed to complete sale", err?.message);
    }
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
          <Typography.Title level={5} className="!mb-0">
            Bill Details
          </Typography.Title>
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
          >
            New
          </Button>
        </div>
      </Card>
      <SectionHeader label="Cart Items" />
      <Card
        className="border-none shadow-sm mb-2"
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
                key={item.stockId}
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
                      onClick={() => onQty(item.stockId, item.quantity - 1)}
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
                      onClick={() => onQty(item.stockId, item.quantity + 1)}
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
                    onChange={(e) => onPrice(item.stockId, Number(e.target.value))}
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
                      onClick={() => onRemove(item.stockId)}
                      icon={<Icon icon="lineicons:close" />}
                    />
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
      </Card>
      <SectionHeader label="Summary" />
      <Card
        className="border-none shadow-sm mb-2"
        styles={{
          body: { padding: 12 },
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <Typography.Text type="secondary">Items</Typography.Text>
            <Typography.Text className="font-medium text-base">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </Typography.Text>
          </div>
          <div className="flex justify-between">
            <Typography.Text type="secondary">Subtotal</Typography.Text>
            <Typography.Text className="font-medium text-base">
              ৳{subtotal.toFixed(2)}
            </Typography.Text>
          </div>
          <div className="flex justify-between items-center">
            <Typography.Text type="secondary">Discount</Typography.Text>
            <Input
              type="number"
              min={0}
              max={subtotal}
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-20 text-right"
              size="small"
              prefix="৳"
            />
          </div>
          <div className="flex justify-between items-center">
            <Typography.Text type="secondary">Custom Total</Typography.Text>
            <Input
              type="number"
              min={0}
              value={total !== computedTotal ? total : ""}
              onChange={(e) => setCustomTotal(e.target.value)}
              placeholder={computedTotal.toFixed(2)}
              className="w-20 text-right"
              size="small"
              prefix="৳"
            />
          </div>
          <Divider className="my-1" />
          <div className="flex justify-between items-center">
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
        className="w-full rounded-xl font-semibold"
        onClick={handleCheckout}
        disabled={cart.length === 0 || !customer}
        icon={<Icon icon="mdi:cash-register" className="text-xl" />}
      >
        Complete Sale
      </Button>

      {/* Checkout Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Icon icon="mdi:cash-register" className="text-xl text-primary" />
            <span>Complete Sale</span>
          </div>
        }
        open={checkoutModalOpen}
        onCancel={() => setCheckoutModalOpen(false)}
        footer={null}
        width={600}
        className="checkout-modal"
      >
        <div className="space-y-6">
          {/* Sale Summary */}
          <Card size="small" className="bg-gray-50 border-none">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="font-semibold text-red-600">-৳{discount.toFixed(2)}</span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-green-600">৳{total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <Typography.Title level={5} className="!mb-0">Payment Methods</Typography.Title>
              <Button
                type="dashed"
                size="small"
                onClick={() => setPayments([...payments, { method: "CASH", amount: 0 }])}
                icon={<Icon icon="mdi:plus" />}
              >
                Add Payment
              </Button>
            </div>
            
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div key={index} className="flex gap-2 items-center p-3 bg-white border border-gray-200 rounded-lg">
                  <Select
                    value={payment.method}
                    onChange={(value) => {
                      const newPayments = [...payments];
                      newPayments[index].method = value;
                      setPayments(newPayments);
                    }}
                    className="flex-1"
                    options={PAYMENT_METHOD_OPTIONS.map(method => ({
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
                      newPayments[index].amount = Number(e.target.value);
                      setPayments(newPayments);
                    }}
                    placeholder="Amount"
                    prefix="৳"
                    className="w-32"
                    min={0}
                    step={0.01}
                  />
                  {payments.length > 1 && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<Icon icon="mdi:close" />}
                      onClick={() => setPayments(payments.filter((_, i) => i !== index))}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Payment Summary */}
            <Card size="small" className="mt-3 bg-blue-50 border-blue-200">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Total Amount:</span>
                  <span className="font-semibold">৳{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Paid:</span>
                  <span className="font-semibold">৳{paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-blue-200 pt-1">
                  <span>Change/Due:</span>
                  <span className={`font-semibold ${due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ৳{Math.abs(paid - total).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Notes */}
          <div>
            <Typography.Text strong className="block mb-2">Notes (optional)</Typography.Text>
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
              onClick={() => setCheckoutModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={confirmCheckout}
              className="flex-1"
              disabled={paid < total}
              icon={<Icon icon="mdi:check" />}
            >
              Complete Sale
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
