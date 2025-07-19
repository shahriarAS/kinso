"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { Input, Select } from "antd";
import ProductGrid from "./ProductGrid";
import CartDetails from "./CartDetails";
import { CartItem, DEFAULT_UNIT_PRICE } from "./types";

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
} 

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    upc: "123456789012",
    category: "electronics",
    stock: [],
  },
  {
    id: "2",
    name: "T-Shirt Black",
    upc: "987654321098",
    category: "clothing",
    stock: [],
  },
  {
    id: "3",
    name: "Organic Apple",
    upc: "555666777888",
    category: "food",
    stock: [],
  },
  {
    id: "4",
    name: "Sony Bluetooth 5.1 Headphones",
    upc: "111222333444",
    category: "electronics",
    stock: [],
  },
]; 



type Props = {};

export default function POS({}: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("walkin");
  const [discount, setDiscount] = useState(0);
  const [customTotal, setCustomTotal] = useState<string | null>(null);

  const filteredProducts = mockProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.upc.includes(search)
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.05;
  const shipping = cart.length > 0 ? 60 : 0;
  const computedTotal = subtotal + tax + shipping - discount;
  const total =
    customTotal !== null && customTotal !== ""
      ? Number(customTotal)
      : computedTotal;

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, price: DEFAULT_UNIT_PRICE }];
    });
  };
  const handleQtyChange = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };
  const handlePriceChange = (id: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: Math.max(0, price) } : item
      )
    );
  };
  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="h-full w-full p-6 px-4 relative overflow-x-hidden flex flex-col gap-4 bg-secondary rounded-3xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-4xl font-bold text-primary tracking-tight">
          Point of Sale
        </h1>
        <Select
          size="large"
          options={[
            { label: "Warehouse A", value: "warehouseA" },
            { label: "Warehouse B", value: "warehouseB" },
            { label: "Warehouse C", value: "warehouseC" },
          ]}
          className="w-52"
          placeholder="Select Warehouse"
        />
      </div>
      <div className="gap-4 grid grid-cols-5">
        <div className="bg-white p-6 rounded-3xl col-span-3">
          <div className="mb-8 flex gap-4 items-center">
            <Input
              size="large"
              placeholder="Search products..."
              className="w-full rounded-xl border-gray-300 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </div>
          <ProductGrid products={filteredProducts} onAdd={handleAddToCart} />
        </div>
        <div className="col-span-2">
          <CartDetails
            cart={cart}
            onQty={handleQtyChange}
            onRemove={handleRemoveFromCart}
            onPrice={handlePriceChange}
            customer={customer}
            setCustomer={setCustomer}
            discount={discount}
            setDiscount={setDiscount}
            total={total}
            setCustomTotal={setCustomTotal}
            computedTotal={computedTotal}
          />
        </div>
      </div>
    </div>
  );
}
