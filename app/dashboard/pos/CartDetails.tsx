"use client";

import { CartItem, CustomerOption } from "./types";
import { CartItems, CartSummary } from "./components";

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
      
      <CartItems
        cart={cart}
        onQty={onQty}
        onRemove={onRemove}
        onPrice={onPrice}
      />
    </>
  );
}
