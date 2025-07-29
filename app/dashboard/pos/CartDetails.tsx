"use client";

import { Icon } from "@iconify/react";
import { CartItem, CustomerOption } from "./types";
import { CartItems, CartSummary } from "./components";
import { UserOutlined } from "@ant-design/icons";
import { Button, Card, Select, Typography } from "antd";

interface CartDetailsProps {
  cart: CartItem[];
  onQty: (stock: string, qty: number) => void;
  onRemove: (stock: string) => void;
  onPrice: (stock: string, price: number) => void;
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
  return (
    <>
      <Card
        className="border border-gray-200 mb-2"
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
            className="flex-1 rounded-sm"
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

      <CartItems
        cart={cart}
        onQty={onQty}
        onRemove={onRemove}
        onPrice={onPrice}
      />

      <CartSummary
        cart={cart}
        customer={customer}
        setCustomer={setCustomer}
        discount={discount}
        setDiscount={setDiscount}
        total={total}
        setCustomTotal={setCustomTotal}
        computedTotal={computedTotal}
        customers={customers}
        onCreateCustomer={onCreateCustomer}
        onCheckoutSuccess={onCheckoutSuccess}
        onSaleComplete={onSaleComplete}
        outlets={outlets}
        selectedOutlet={selectedOutlet}
      />
    </>
  );
}
