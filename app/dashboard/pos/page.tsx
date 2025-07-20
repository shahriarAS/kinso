"use client";
import { useState, useEffect, useRef } from "react";
import type { Product } from "@/types/product";
import { Input, Select, message, Spin } from "antd";
import { useGetWarehousesQuery } from "@/store/api/warehouses";
import { useGetCustomersQuery } from "@/store/api/customers";
import ProductGrid from "./ProductGrid";
import CartDetails from "./CartDetails";
import CustomerModal from "./CustomerModal";
import { CartItem, DEFAULT_UNIT_PRICE, CustomerOption, WarehouseOption } from "./types";
import InvoiceTemplate from "./InvoiceTemplate";
import type { InvoiceData } from "./InvoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Skeleton } from "antd";
import { useGetProductsQuery } from "@/hooks/useApi";

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("walkin");
  const [discount, setDiscount] = useState(0);
  const [customTotal, setCustomTotal] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [lastInvoiceData, setLastInvoiceData] = useState<InvoiceData | null>(null);
  const searchInputRef = useRef<any>(null);
  const printContainerRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: warehousesData, isLoading: warehousesLoading } = useGetWarehousesQuery({
    limit: 100,
  });
  
  const { data: customersData, isLoading: customersLoading } = useGetCustomersQuery({
    limit: 100,
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useGetProductsQuery({
    limit: 10000,
    warehouse: selectedWarehouse || undefined,
  });


  // Prepare warehouse options
  const warehouseOptions: WarehouseOption[] = warehousesData?.data.map(warehouse => ({
    label: warehouse.name,
    value: warehouse._id,
    _id: warehouse._id,
  })) || [];

  // Prepare customer options
  const customerOptions: CustomerOption[] = [
    { label: "Walk-in Customer", value: "walkin" },
    ...(customersData?.data.map(customer => ({
      label: customer.name,
      value: customer._id,
      _id: customer._id,
      email: customer.email,
      phone: customer.phone,
    })) || []),
  ];

  // Get products from inventory
  const products: Product[] = inventoryData?.data.map((item: Product) => ({
    _id: item._id,
    name: item.name,
    upc: item.upc,
    sku: item.sku,
    category: item.category,
    stock: item.stock,
  })) || [];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.upc.includes(search) ||
      p.sku.includes(search)
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const computedTotal = subtotal - discount;
  const total =
    customTotal !== null && customTotal !== ""
      ? Number(customTotal)
      : computedTotal;

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item._id === product._id);
      if (found) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Use the actual MRP price from warehouse inventory
      const stockItem = product.stock[0];
      const price = stockItem?.mrp || DEFAULT_UNIT_PRICE;
      return [...prev, { ...product, quantity: 1, price: Number(price) }];
    });
  };

  const handleQtyChange = (_id: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === _id ? { ...item, quantity: Math.max(1, qty) } : item
      )
    );
  };

  const handlePriceChange = (_id: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === _id ? { ...item, price: Math.max(0, price) } : item
      )
    );
  };

  const handleRemoveFromCart = (_id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== _id));
  };

  const handleCustomerCreated = (newCustomer: { _id: string; name: string; value: string }) => {
    setCustomer(newCustomer.value);
    message.success(`Customer ${newCustomer.name} created and selected!`);
  };

  const handleCheckoutSuccess = () => {
    setCart([]);
    setDiscount(0);
    setCustomTotal(null);
    setCustomer("walkin");
    message.success("Cart cleared! Ready for next sale.");
    // Refocus search bar
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleOrderCompleted = (invoiceData: InvoiceData) => {
    setLastInvoiceData(invoiceData);
    setCart([]);
    setDiscount(0);
    setCustomTotal(null);
    setCustomer("walkin");
    message.success("Cart cleared! Ready for next sale.");
    // Refocus search bar
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  useEffect(() => {
    if (lastInvoiceData && printContainerRef.current) {
      setTimeout(async () => {
        const input = printContainerRef.current;
        if (!input) return;
        const canvas = await html2canvas(input, { scale: 2, useCORS: false, backgroundColor: '#fff' });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.autoPrint();
        const pdfBlob = pdf.output("bloburl");
        window.open(pdfBlob);
        setLastInvoiceData(null);
      }, 100);
    }
  }, [lastInvoiceData]);

  // Focus search bar on mount and after order/checkout
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);


  return (
    <>
      <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1, width: 794, height: 1123, background: "white" }}>
        {lastInvoiceData && (
          <div ref={printContainerRef} style={{ width: 794, minHeight: 1123, background: "white", padding: 24 }}>
            <InvoiceTemplate data={lastInvoiceData} />
          </div>
        )}
      </div>
      <div className="h-full w-full p-6 px-4 relative overflow-x-hidden flex flex-col gap-4 bg-secondary rounded-3xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-4xl font-bold text-primary tracking-tight">
          Point of Sale
        </h1>
        <Select
          size="large"
          options={[
            {
              label: "All Warehouses",
              value: "",
            },
            ...warehouseOptions,
          ]}
          value={selectedWarehouse}
          onChange={setSelectedWarehouse}
          className="w-52"
          placeholder="Select Warehouse"
          loading={warehousesLoading}
        />
      </div>
      <div className="relative">
        {(warehousesLoading || inventoryLoading) && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-80" style={{ pointerEvents: 'auto' }}>
            <div className="gap-4 grid grid-cols-5 w-full h-full p-6">
              {/* ProductGrid Skeleton (col-span-3) */}
              <div className="col-span-3">
                <div className="mb-8 flex gap-4 items-center">
                  <Skeleton.Input active size="large" className="w-full rounded-xl" style={{ height: 40 }} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 min-h-[220px] flex flex-col gap-3 border border-gray-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-1">
                        <Skeleton.Avatar active size={40} shape="square" />
                        <div className="flex flex-col flex-1">
                          <Skeleton.Input active size="small" style={{ width: 120, height: 18, marginBottom: 4 }} />
                          <Skeleton.Input active size="small" style={{ width: 80, height: 14 }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton.Button active size="small" style={{ width: 60, height: 20 }} />
                        <Skeleton.Button active size="small" style={{ width: 40, height: 20 }} />
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <Skeleton.Input active size="small" style={{ width: 60, height: 24 }} />
                        <Skeleton.Input active size="small" style={{ width: 50, height: 16 }} />
                      </div>
                      <Skeleton.Button active size="large" style={{ width: '100%', height: 40, borderRadius: 12 }} />
                    </div>
                  ))}
                </div>
              </div>
              {/* CartDetails Skeleton (col-span-2) */}
              <div className="col-span-2">
                <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col gap-3 shadow-lg min-h-[500px] overflow-hidden relative">
                  <div className="font-semibold text-xl text-primary flex justify-between items-center mb-1">
                    <Skeleton.Input active size="small" style={{ width: 120, height: 24 }} />
                    <Skeleton.Input active size="small" style={{ width: 80, height: 16 }} />
                  </div>
                  <div className="flex gap-2 mb-1">
                    <Skeleton.Input active size="large" style={{ width: '100%', height: 40, borderRadius: 24 }} />
                    <Skeleton.Button active size="large" style={{ width: 48, height: 40, borderRadius: 8 }} />
                  </div>
                  <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-gray-100 py-4 gap-4 bg-white/80 rounded-xl px-2">
                        <div className="flex items-center gap-3 w-1/3">
                          <div>
                            <Skeleton.Input active size="small" style={{ width: 80, height: 16, marginBottom: 4 }} />
                            <Skeleton.Input active size="small" style={{ width: 60, height: 12 }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-2/3">
                          <Skeleton.Button active size="small" style={{ width: 32, height: 32, borderRadius: 16 }} />
                          <Skeleton.Input active size="small" style={{ width: 28, height: 24 }} />
                          <Skeleton.Button active size="small" style={{ width: 32, height: 32, borderRadius: 16 }} />
                          <Skeleton.Input active size="large" style={{ width: 60, height: 32 }} />
                          <Skeleton.Input active size="small" style={{ width: 50, height: 20 }} />
                          <Skeleton.Button active size="small" style={{ width: 32, height: 32, borderRadius: 16 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Cart summary skeleton */}
                  <div className="pt-4 border-t border-gray-200 text-sm flex flex-col gap-1">
                    <div className="flex justify-between">
                      <Skeleton.Input active size="small" style={{ width: 60, height: 16 }} />
                      <Skeleton.Input active size="small" style={{ width: 30, height: 16 }} />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton.Input active size="small" style={{ width: 60, height: 16 }} />
                      <Skeleton.Input active size="small" style={{ width: 50, height: 16 }} />
                    </div>
                    <div className="flex justify-between items-center">
                      <Skeleton.Input active size="small" style={{ width: 60, height: 16 }} />
                      <Skeleton.Input active size="large" style={{ width: 80, height: 32 }} />
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 items-center">
                      <Skeleton.Input active size="small" style={{ width: 60, height: 20 }} />
                      <Skeleton.Input active size="large" style={{ width: 80, height: 32 }} />
                    </div>
                    <Skeleton.Button active size="large" style={{ width: '100%', height: 40, borderRadius: 12, marginTop: 16 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className={warehousesLoading || inventoryLoading ? 'pointer-events-none opacity-50' : ''}>
          {/* The original grid content */}
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
                  ref={searchInputRef}
                />
              </div>
              {inventoryLoading ? (
                <div className="text-center py-8 text-gray-500">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {search ? "No products found matching your search" : "No products available in this warehouse"}
                </div>
              ) : (
                <ProductGrid products={filteredProducts} onAdd={handleAddToCart} />
              )}
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
                customers={customerOptions}
                onCreateCustomer={() => setCustomerModalOpen(true)}
                onCheckoutSuccess={handleCheckoutSuccess}
                onOrderCompleted={handleOrderCompleted}
              />
            </div>
          </div>
        </div>
      </div>

      <CustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
    </>
  );
}