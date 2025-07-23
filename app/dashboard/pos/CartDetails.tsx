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
import { useCreateOrderMutation } from "@/features/orders";
import { useNotification } from "@/hooks/useNotification";
import { CartItem, CustomerOption } from "./types";
import type { InvoiceData } from "./InvoiceTemplate";
import { OrderInput, OrderItem, Payment } from "@/features/orders/types";
import { PAYMENT_METHODS } from "@/lib/constraints";
import { Product } from "@/features/products/types";
import { UserOutlined } from "@ant-design/icons";
import { useGetSettingsQuery } from "@/features/settings";

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
  selectedWarehouse: string;
  products: Product[];
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

// Payment method icon mapping
const PAYMENT_METHOD_ICONS: Record<string, string> = {
  CASH: "mdi:cash",
  BKASH: "mdi:cellphone",
  ROCKET: "mdi:rocket",
  NAGAD: "mdi:wallet",
  BANK: "mdi:bank",
};

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
  selectedWarehouse,
  products,
}: CartDetailsProps) {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([
    { method: "CASH", amount: 0 },
  ]);
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const { success, error } = useNotification();
  const { data: settingsData } = useGetSettingsQuery();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
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
    if (payments.length === 0 || paid <= 0) {
      error("Please enter at least one payment.");
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
      // Prepare payload for backend (product: string)
      const orderPayload: OrderInput = {
        customerId: customer,
        customerName: selectedCustomer?.label || "Unknown Customer",
        items: cart.map((item) => ({
          product: item._id, // string ID for backend
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        totalAmount: total,
        payments,
        discount,
        notes: discount > 0 ? `Discount applied: ৳${discount}` : undefined,
        warehouse: selectedWarehouse, // Pass warehouse
      };
      // The API slice expects the wrong type for createOrder, but our payload matches the backend expectation.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await createOrder(orderPayload as any).unwrap();
      const order = response.data;

      // Fallback numberToWords if not available
      function numberToWords(num: number): string {
        if (num === 0) return "zero";
        const belowTwenty = [
          "",
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
          "ten",
          "eleven",
          "twelve",
          "thirteen",
          "fourteen",
          "fifteen",
          "sixteen",
          "seventeen",
          "eighteen",
          "nineteen",
        ];
        const tens = [
          "",
          "",
          "twenty",
          "thirty",
          "forty",
          "fifty",
          "sixty",
          "seventy",
          "eighty",
          "ninety",
        ];
        const thousand = 1000;
        const lakh = 100000;
        function helper(n: number): string {
          if (n < 20) return belowTwenty[n];
          if (n < 100)
            return (
              tens[Math.floor(n / 10)] +
              (n % 10 ? " " + belowTwenty[n % 10] : "")
            );
          if (n < thousand)
            return (
              belowTwenty[Math.floor(n / 100)] +
              " hundred" +
              (n % 100 ? " " + helper(n % 100) : "")
            );
          if (n < lakh)
            return (
              helper(Math.floor(n / thousand)) +
              " thousand" +
              (n % thousand ? " " + helper(n % thousand) : "")
            );
          return (
            helper(Math.floor(n / lakh)) +
            " lakh" +
            (n % lakh ? " " + helper(n % lakh) : "")
          );
        }
        return helper(num);
      }

      const customerObj =
        typeof order.customerId === "object" && order.customerId !== null
          ? order.customerId
          : {
              _id: order.customerId,
              name: order.customerName,
              email: undefined,
              phone: undefined,
            };

      const subtotal = order.items.reduce(
        (sum: number, item: { totalPrice: number }) => sum + item.totalPrice,
        0,
      );
      const orderDiscount =
        typeof order.discount === "number"
          ? order.discount
          : subtotal - order.totalAmount;
      const orderPayments =
        order.payments?.map((p: { method: string; amount: number }) => ({
          method: p.method || "Cash",
          amount: Number(p.amount) || 0,
        })) || [];
      const paid = orderPayments.reduce(
        (sum: number, p: { amount: number }) => sum + (Number(p.amount) || 0),
        0,
      );
      const due = Math.max(0, order.totalAmount - paid);
      const inWords = numberToWords(order.totalAmount) + " Taka Only";

      const invoiceData: InvoiceData = {
        _id: order._id,
        invoiceNumber: order.orderNumber || "N/A",
        date: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString()
          : new Date().toLocaleDateString(),
        customer: {
          name: customerObj.name,
          email: customerObj.email || "dummy@email.com",
          phone: customerObj.phone || "0123456789",
        },
        company: {
          name: "EZ POS",
          address: "123 Main St, Suite 100, Dhaka",
          logo: "EZ",
          mobile: "01700000000",
          email: "info@ezpos.com",
          soldBy: "Cashier Name",
        },
        items: order.items.map((item: OrderItem) => ({
          title: item.product.name,
          description: `SKU: ${item.product.sku}; UPC: ${item.product.upc}`,
          quantity: item.quantity,
          rate: item.unitPrice,
          price: item.totalPrice,
          warranty: item.product.warranty
            ? `${item.product.warranty.value} ${item.product.warranty.unit}`
            : "N/A",
        })),
        subtotal,
        discount: orderDiscount,
        total: order.totalAmount,
        signatory: {
          name: "Cashier Name",
          title: "Cashier",
        },
        payments: orderPayments,
        paid,
        due,
        inWords,
        invoiceFooter: settingsData?.data?.invoiceFooter || undefined,
      };
      success("Order created successfully!");
      setCheckoutModalOpen(false);
      if (onOrderCompleted) onOrderCompleted(invoiceData);
      onCheckoutSuccess();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      error("Failed to create order", err.data?.message);
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
            const product = products.find((p) => p._id === item._id);
            const stockItem = product?.stock.find(
              (s) => s.warehouse._id === selectedWarehouse,
            );
            const maxQty = stockItem ? stockItem.unit : 0;
            return (
              <div
                key={item._id}
                className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0 gap-2 hover:bg-gray-100 rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-2 w-[40%]">
                  {/* <Avatar shape="square" size={40} icon={<ShoppingCartOutlined />} className="bg-gray-200" /> */}
                  <div>
                    <Typography.Text
                      strong
                      className="text-primary text-sm line-clamp-2"
                    >
                      {item.name}
                    </Typography.Text>
                    <div className="text-xs text-gray-600">SKU: {item.sku}</div>
                    {/* <div className="text-xs text-gray-500">
                      Stock: {maxQty}
                    </div> */}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-[60%]">
                  <div className="flex items-center gap-1">
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
                    onChange={(e) => onPrice(item._id, Number(e.target.value))}
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
                      onClick={() => onRemove(item._id)}
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
            <Typography.Text type="danger">Discount</Typography.Text>
            <Input
              type="number"
              min={0}
              value={discount}
              size="middle"
              className="w-40 text-right font-semibold text-base"
              onChange={(e) => setDiscount(Number(e.target.value))}
              prefix="৳"
              style={{ textAlign: "right" }}
            />
          </div>
          <Divider className="!my-2" />
          <div className="flex justify-between items-center">
            <Typography.Title level={5} className="!mb-0 flex items-center">
              Total
            </Typography.Title>
            <Input
              type="number"
              min={0}
              value={total}
              size="middle"
              className="w-40 text-right font-bold text-green-700 text-base"
              onChange={(e) => setCustomTotal(e.target.value)}
              prefix="৳"
              style={{ textAlign: "right" }}
              placeholder={computedTotal.toString()}
            />
          </div>
        </div>
      </Card>
      {cart.length > 0 && (
        <>
          <SectionHeader label="Payments" />
          <Card
            className="border-none shadow-sm mb-2"
            styles={{
              body: { padding: 16 },
            }}
          >
            {/* Payment Summary Chips */}
            <div className="mb-4">
              <div className="flex gap-2 justify-between w-full">
                {/* <div className="bg-gray-100 rounded-full px-4 py-2 text-base font-bold text-gray-700 flex items-center min-h-[36px]">
                  <Icon icon="mdi:cash-multiple" className="mr-2 text-green-600 text-lg" />
                  Total: <span className="ml-2 text-green-700 font-bold">৳{total.toFixed(2)}</span>
                </div> */}
                <div className="bg-green-100 rounded-full px-4 py-2 text-base font-bold text-green-700 flex items-center min-h-[36px]">
                  <Icon icon="mdi:check-circle" className="mr-2 text-lg" />
                  Paid: <span className="ml-2">৳{paid.toFixed(2)}</span>
                </div>
                <div
                  className={`rounded-full px-4 py-2 text-base font-bold flex items-center min-h-[36px] ${due > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"}`}
                >
                  <Icon icon="mdi:alert-circle" className="mr-2 text-lg" />
                  Due: <span className="ml-2">৳{due.toFixed(2)}</span>
                </div>
              </div>
            </div>
            {/* Payment Rows */}
            <div className="flex flex-col gap-2">
              {payments.map((payment, idx) => {
                return (
                  <div
                    key={idx}
                    className="group flex flex-col sm:flex-row gap-2 items-center bg-gray-50 rounded-lg px-3 py-2 relative transition-all border border-transparent hover:border-primary"
                  >
                    <div className="flex-1 flex gap-2 items-center w-full sm:w-auto">
                      <Select
                        options={PAYMENT_METHODS.map((method) => ({
                          label: (
                            <span className="flex items-center gap-1">
                              <Icon
                                icon={
                                  PAYMENT_METHOD_ICONS[method.value] ||
                                  "mdi:credit-card"
                                }
                              />
                              {method.label}
                            </span>
                          ),
                          value: method.value,
                        }))}
                        value={payment.method}
                        onChange={(val) =>
                          setPayments(
                            payments.map((p, i) =>
                              i === idx ? { ...p, method: val } : p,
                            ),
                          )
                        }
                        className="w-36"
                        size="middle"
                        placeholder="Method"
                        dropdownMatchSelectWidth={false}
                      />
                      <Input
                        type="number"
                        min={0}
                        value={payment.amount}
                        size="middle"
                        className="w-36 text-right font-semibold"
                        onChange={(e) =>
                          setPayments(
                            payments.map((p, i) =>
                              i === idx
                                ? { ...p, amount: Number(e.target.value) }
                                : p,
                            ),
                          )
                        }
                        prefix="৳"
                        style={{ textAlign: "right" }}
                        placeholder="Amount"
                        status={payment.amount <= 0 ? "error" : undefined}
                      />
                    </div>
                    {/* Remove button only if more than 1 payment */}
                    {payments.length > 1 && (
                      <Tooltip title="Remove">
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<Icon icon="lineicons:close" />}
                          onClick={() =>
                            setPayments(payments.filter((_, i) => i !== idx))
                          }
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2"
                        />
                      </Tooltip>
                    )}
                    {/* Inline validation */}
                    {payment.amount <= 0 && (
                      <span className="text-xs text-red-500 mt-1 sm:mt-0 sm:ml-2">
                        Enter a valid amount
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Add Payment Row (always visible) */}
              <div className="flex gap-2 items-center px-3 py-2">
                <Select
                  options={PAYMENT_METHODS.map((method) => ({
                    label: (
                      <span className="flex items-center gap-1">
                        <Icon
                          icon={
                            PAYMENT_METHOD_ICONS[method.value] ||
                            "mdi:credit-card"
                          }
                        />
                        {method.label}
                      </span>
                    ),
                    value: method.value,
                  }))}
                  value={null}
                  onChange={(val) => {
                    if (val)
                      setPayments([...payments, { method: val, amount: 0 }]);
                  }}
                  className="w-36"
                  size="middle"
                  placeholder="Add Payment Method"
                  dropdownMatchSelectWidth={false}
                />
                <Input
                  type="number"
                  min={0}
                  value={""}
                  size="middle"
                  className="w-36 text-right font-semibold"
                  disabled
                  prefix="৳"
                  style={{ textAlign: "right" }}
                  placeholder="Amount"
                />
              </div>
            </div>
            {/* Overpayment validation */}
            {paid > total && (
              <div className="text-xs text-red-500 mt-2">
                Total paid cannot exceed total amount.
              </div>
            )}
          </Card>
        </>
      )}
      <Button
        size="large"
        type="primary"
        className="w-full mt-2 text-lg font-semibold py-2 rounded-xl transition-all"
        onClick={handleCheckout}
        disabled={cart.length === 0}
      >
        Checkout
      </Button>

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
          >
            Confirm Order
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ৳{total.toFixed(2)}
            </div>
            <div className="text-gray-500">Total Amount</div>
          </div>
          <div className="border-t pt-4">
            <div className="mb-2 font-semibold">Payments:</div>
            {payments.map((p, idx) => (
              <div key={idx} className="flex justify-between mb-1">
                <span>
                  {PAYMENT_METHODS.find((m) => m.value === p.method)?.label ||
                    p.method}
                  :
                </span>
                <span>৳{Number(p.amount).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between mt-2">
              <span className="text-green-700 font-semibold">Paid:</span>
              <span className="text-green-700 font-semibold">
                ৳{paid.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-500 font-semibold">Due:</span>
              <span className="text-red-500 font-semibold">
                ৳{due.toFixed(2)}
              </span>
            </div>
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
                <span>-৳{discount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
