"use client";

import { Input, Select, Button, Tooltip, Modal, message } from "antd";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useCreateOrderMutation } from "@/store/api/orders";
import { CartItem, CustomerOption } from "./types";
import { getInitials } from "./page";
import type { InvoiceData } from "./InvoiceTemplate";

interface OrderCreatePayload {
  customerId: string;
  customerName: string;
  items: {
    product: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  discount?: number;
  notes?: string;
}

interface CartDetailsProps {
  cart: CartItem[];
  onQty: (_id: string, qty: number) => void;
  onRemove: (_id: string) => void;
  onPrice: (_id: string, price: number) => void;
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
  onOrderCompleted?: (invoiceData: InvoiceData) => void;
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
  onOrderCompleted,
}: CartDetailsProps) {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) {
      message.error("Cart is empty!");
      return;
    }

    if (customer === "walkin") {
      message.error("Please select a customer!");
      return;
    }

    setCheckoutModalOpen(true);
  };

  const confirmCheckout = async () => {
    try {
      const selectedCustomer = customers.find((c) => c.value === customer);
      // Prepare payload for backend (product: string)
      const orderPayload: OrderCreatePayload = {
        customerId: customer,
        customerName: selectedCustomer?.label || "Unknown Customer",
        items: cart.map((item) => ({
          product: item._id, // string ID for backend
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        totalAmount: total,
        discount,
        notes: discount > 0 ? `Discount applied: $${discount}` : undefined,
      };
      // The API slice expects the wrong type for createOrder, but our payload matches the backend expectation.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await createOrder(orderPayload as any).unwrap();
      const order = response.data;

      // Handle customerId (string or object)
      let customerObj: any;
      if (typeof order.customerId === "object" && order.customerId !== null) {
        customerObj = order.customerId;
      } else {
        customerObj = { _id: order.customerId, name: order.customerName, email: undefined, phone: undefined };
      }

      // Build InvoiceData from server order
      const invoiceData: InvoiceData = {
        invoiceNumber: order.orderNumber,
        date: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
        customerId: customerObj._id,
        customer: {
          name: customerObj.name,
          location: "",
          id: customerObj._id,
          email: typeof customerObj.email === "string" ? customerObj.email : undefined,
          phone: typeof customerObj.phone === "string" ? customerObj.phone : undefined,
        },
        company: {
          name: "EZ POS",
          location: "Your City, Country",
          address: "123 Main St, Suite 100",
          phone: "+1-555-123-4567",
          email: "info@ezpos.com",
          website: "www.ezpos.com",
          logo: "EZ",
        },
        items: order.items.map((item: any) => {
          // Handle product (string or object)
          const productObj =
            typeof item.product === "object" && item.product !== null
              ? item.product
              : { name: "Unknown", upc: "" };
          return {
            description: productObj.name,
            details: `UPC: ${productObj.upc}`,
            quantity: item.quantity,
            rate: item.unitPrice,
            price: item.totalPrice,
          };
        }),
        subtotal: (order.totalAmount || 0) + (order.discount || 0),
        discount: order.discount || 0,
        total: order.totalAmount,
        signatory: {
          name: "EZ POS",
          title: "Cashier",
        },
      };
      message.success("Order created successfully!");
      setCheckoutModalOpen(false);
      if (onOrderCompleted) onOrderCompleted(invoiceData);
      onCheckoutSuccess();
    } catch (error: any) {
      message.error(error.data?.message || "Failed to create order");
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col gap-3 shadow-lg min-h-[500px] overflow-hidden relative">
        <div className="font-semibold text-xl text-primary flex justify-between items-center mb-1">
          Bill Details
          <span className="text-xs text-gray-400 font-normal">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        <div className="flex gap-2 mb-1">
          <Select
            options={customers}
            value={customer}
            onChange={setCustomer}
            className="flex-1"
            size="large"
            placeholder="Select Customer"
            popupClassName="rounded-xl"
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
            className="!bg-primary hover:!bg-primary/90 !border-primary"
          >
            New
          </Button>
        </div>
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {cart.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No items in cart
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
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
                    onClick={() => onQty(item._id, item.quantity - 1)}
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
                    onClick={() => onQty(item._id, item.quantity + 1)}
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
                  onChange={(e) => onPrice(item._id, Number(e.target.value))}
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
                    onClick={() => onRemove(item._id)}
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
            <span>${subtotal.toFixed(2)}</span>
          </div>
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
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Checkout
          </Button>
        </div>
      </div>

      <Modal
        title="Confirm Checkout"
        open={checkoutModalOpen}
        onCancel={() => setCheckoutModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setCheckoutModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={isCreatingOrder}
            onClick={confirmCheckout}
            className="!bg-primary hover:!bg-primary/90 !border-primary"
          >
            Confirm Order
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${total.toFixed(2)}</div>
            <div className="text-gray-500">Total Amount</div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Items:</span>
              <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Customer:</span>
              <span>{customers.find((c) => c.value === customer)?.label}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
