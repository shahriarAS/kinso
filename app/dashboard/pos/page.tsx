"use client";;
import { useState, useEffect, useRef, useCallback } from "react";
import type { Product } from "@/features/products/types";
import { Input, Select } from "antd";
import { useGetWarehousesQuery } from "@/features/warehouses";
import { useGetCustomersQuery } from "@/features/customers";
import { useNotification } from "@/hooks/useNotification";
import ProductGrid from "./ProductGrid";
import CartDetails from "./CartDetails";
import CustomerModal from "./CustomerModal";
import { CartItem, CustomerOption, WarehouseOption } from "./types";
import InvoicePDF from "@/components/common/InvoicePDF";
import { pdf } from "@react-pdf/renderer";
import { useLazyGetOrderQuery } from "@/features/orders/api";
import { useGetSettingsQuery } from "@/features/settings";
import { mapOrderToInvoiceDataWithSettings } from "@/features/orders/utils";
import { Skeleton } from "antd";
import { useGetProductsQuery } from "@/features/products";
import { useFetchAuthUserQuery } from "@/features/auth";
import toast from "react-hot-toast";

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [customTotal, setCustomTotal] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const { data: userData } = useFetchAuthUserQuery();
  const { data: settingsData } = useGetSettingsQuery(undefined);
  const [getOrder] = useLazyGetOrderQuery();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchInputRef = useRef<any>(null);
  const { success, error } = useNotification();

  const downloadPDF = useCallback(
    async (orderId: string) => {
      if (!orderId || !settingsData) {
        toast.error("Order or settings not found");
        return;
      }
      try {
        const orderRes = await getOrder(orderId).unwrap();
        if (!orderRes?.data) {
          toast.error("Order not found");
          return;
        }
        const invoiceData = mapOrderToInvoiceDataWithSettings(
          orderRes.data,
          settingsData.data,
          userData?.user?.name,
        );
        const blob = await pdf(<InvoicePDF data={invoiceData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceData.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        toast.error("Failed to download Invoice");
        console.error("Failed to download PDF", err);
      }
    },
    [getOrder, settingsData, userData]
  );

  // API hooks
  const { data: warehousesData, isLoading: warehousesLoading } =
    useGetWarehousesQuery({
      limit: 100,
    });

  const { data: customersData } = useGetCustomersQuery({
    limit: 100,
  });

  const {
    data: inventoryData,
    isLoading: inventoryLoading,
    refetch: refetchProducts,
  } = useGetProductsQuery({
    limit: 10000,
    warehouse: selectedWarehouse || undefined,
  });

  // Prepare warehouse options
  const warehouseOptions: WarehouseOption[] =
    warehousesData?.data.map((warehouse) => ({
      label: warehouse.name,
      value: warehouse._id,
      _id: warehouse._id,
    })) || [];

  // Prepare customer options
  const customerOptions: CustomerOption[] = [
    { label: "Select A Customer", value: "", disabled: true },
    ...(customersData?.data.map((customer) => ({
      label: customer.name,
      value: customer._id,
      _id: customer._id,
      email: customer.email,
      phone: customer.phone,
    })) || []),
  ];

  // Get products from inventory
  // Cast to Product[] for POS context (only required fields used)
  const products: Product[] =
    (inventoryData?.data.map((item: Product) => ({
      _id: item._id,
      name: item.name,
      upc: item.upc,
      sku: item.sku,
      category: item.category,
      stock: item.stock,
    })) as Product[]) || [];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.upc.includes(search) ||
      p.sku.includes(search),
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const computedTotal = subtotal - discount;
  const total =
    customTotal !== null && customTotal !== ""
      ? Number(customTotal)
      : computedTotal;

  // In handleAddToCart, use warehouse-specific stock/price
  const handleAddToCart = (product: Product) => {
    const stockItem = product.stock.find(
      (s) => s.warehouse._id === selectedWarehouse,
    );
    if (!stockItem || stockItem.unit === 0) return;
    setCart((prev) => {
      const found = prev.find((item) => item._id === product._id);
      if (found) {
        // Cap at max stock
        const newQty = Math.min(found.quantity + 1, stockItem.unit);
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: newQty, price: Number(stockItem.mrp) }
            : item,
        );
      }
      return [
        ...prev,
        { ...product, quantity: 1, price: Number(stockItem.mrp) },
      ];
    });
  };

  // In handleQtyChange, cap at warehouse stock
  const handleQtyChange = (_id: string, qty: number) => {
    const product = products.find((p) => p._id === _id);
    if (!product) return;
    const stockItem = product.stock.find(
      (s) => s.warehouse._id === selectedWarehouse,
    );
    const maxQty = stockItem ? stockItem.unit : 0;
    setCart((prev) =>
      prev.map((item) =>
        item._id === _id
          ? { ...item, quantity: Math.max(1, Math.min(qty, maxQty)) }
          : item,
      ),
    );
  };

  const handlePriceChange = (_id: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === _id ? { ...item, price: Math.max(0, price) } : item,
      ),
    );
  };

  const handleRemoveFromCart = (_id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== _id));
  };

  const handleCustomerCreated = (newCustomer: {
    _id: string;
    name: string;
    value: string;
  }) => {
    setCustomer(newCustomer.value);
    success(`Customer ${newCustomer.name} created and selected!`);
  };

  const handleCheckoutSuccess = () => {
    setCart([]);
    setDiscount(0);
    setCustomTotal(null);
    setCustomer("");
    success("Cart cleared! Ready for next sale.");
    refetchProducts(); // Refetch products after order
    // Refocus search bar
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleOrderCompleted = (orderId: string) => {
    if (orderId) {
      downloadPDF(orderId);
    }
    setCart([]);
    setDiscount(0);
    setCustomTotal(null);
    setCustomer("");
    success("Cart cleared! Ready for next sale.");
    refetchProducts();
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Focus search bar on mount and after order/checkout
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Clear cart on warehouse change
  useEffect(() => {
    if (warehousesData && warehousesData.data.length > 0) {
      if (localStorage.getItem("selectedWarehouse")) {
        setSelectedWarehouse(localStorage.getItem("selectedWarehouse") || "");
      } else {
        setSelectedWarehouse(warehousesData.data[0]._id);
        localStorage.setItem("selectedWarehouse", warehousesData.data[0]._id);
      }
    }
  }, [warehousesData]);

  return (
    <>
      {/* No modal or PDFDownloadLink needed */}
      <div className="h-full w-full p-6 px-4 relative overflow-x-hidden flex flex-col gap-4 bg-secondary rounded-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Point of Sale
          </h1>
          <Select
            size="large"
            options={warehouseOptions}
            value={selectedWarehouse}
            onChange={(value) => {
              if (cart.length > 0 && value !== selectedWarehouse) {
              } else {
                setSelectedWarehouse(value);
                localStorage.setItem("selectedWarehouse", value);
              }
            }}
            className="w-52"
            placeholder="Select Warehouse"
            loading={warehousesLoading}
          />
        </div>
        <div className="relative">
          {(warehousesLoading || inventoryLoading) && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white bg-opacity-80"
              style={{ pointerEvents: "auto" }}
            >
              <div className="gap-4 grid grid-cols-5 w-full h-full p-6">
                {/* ProductGrid Skeleton (col-span-3) */}
                <div className="col-span-3">
                  <div className="mb-8 flex gap-4 items-center">
                    <Skeleton.Input
                      active
                      size="large"
                      className="w-full rounded-xl"
                      style={{ height: 40 }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-xl p-6 min-h-[220px] flex flex-col gap-3 border border-gray-200 shadow-lg"
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <Skeleton.Avatar active size={40} shape="square" />
                          <div className="flex flex-col flex-1">
                            <Skeleton.Input
                              active
                              size="small"
                              style={{
                                width: 120,
                                height: 18,
                                marginBottom: 4,
                              }}
                            />
                            <Skeleton.Input
                              active
                              size="small"
                              style={{ width: 80, height: 14 }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Skeleton.Button
                            active
                            size="small"
                            style={{ width: 60, height: 20 }}
                          />
                          <Skeleton.Button
                            active
                            size="small"
                            style={{ width: 40, height: 20 }}
                          />
                        </div>
                        <div className="flex items-center justify-between mb-1">
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: 60, height: 24 }}
                          />
                          <Skeleton.Input
                            active
                            size="small"
                            style={{ width: 50, height: 16 }}
                          />
                        </div>
                        <Skeleton.Button
                          active
                          size="large"
                          style={{
                            width: "100%",
                            height: 40,
                            borderRadius: 12,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* CartDetails Skeleton (col-span-2) */}
                <div className="col-span-2">
                  <div className="bg-white border border-gray-200 rounded-3xl p-4 flex flex-col gap-3 shadow-lg min-h-[500px] overflow-hidden relative">
                    <div className="font-semibold text-xl text-primary flex justify-between items-center mb-1">
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 120, height: 24 }}
                      />
                      <Skeleton.Input
                        active
                        size="small"
                        style={{ width: 80, height: 16 }}
                      />
                    </div>
                    <div className="flex gap-2 mb-1">
                      <Skeleton.Input
                        active
                        size="large"
                        style={{ width: "100%", height: 40, borderRadius: 24 }}
                      />
                      <Skeleton.Button
                        active
                        size="large"
                        style={{ width: 48, height: 40, borderRadius: 8 }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border-b border-gray-100 py-4 gap-4 bg-white/80 rounded-xl px-2"
                        >
                          <div className="flex items-center gap-3 w-1/3">
                            <div>
                              <Skeleton.Input
                                active
                                size="small"
                                style={{
                                  width: 80,
                                  height: 16,
                                  marginBottom: 4,
                                }}
                              />
                              <Skeleton.Input
                                active
                                size="small"
                                style={{ width: 60, height: 12 }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-2/3">
                            <Skeleton.Button
                              active
                              size="small"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                              }}
                            />
                            <Skeleton.Input
                              active
                              size="small"
                              style={{ width: 28, height: 24 }}
                            />
                            <Skeleton.Button
                              active
                              size="small"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                              }}
                            />
                            <Skeleton.Input
                              active
                              size="large"
                              style={{ width: 60, height: 32 }}
                            />
                            <Skeleton.Input
                              active
                              size="small"
                              style={{ width: 50, height: 20 }}
                            />
                            <Skeleton.Button
                              active
                              size="small"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Cart summary skeleton */}
                    <div className="pt-4 border-t border-gray-200 text-sm flex flex-col gap-1">
                      <div className="flex justify-between">
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 60, height: 16 }}
                        />
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 30, height: 16 }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 60, height: 16 }}
                        />
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 50, height: 16 }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 60, height: 16 }}
                        />
                        <Skeleton.Input
                          active
                          size="large"
                          style={{ width: 80, height: 32 }}
                        />
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300 items-center">
                        <Skeleton.Input
                          active
                          size="small"
                          style={{ width: 60, height: 20 }}
                        />
                        <Skeleton.Input
                          active
                          size="large"
                          style={{ width: 80, height: 32 }}
                        />
                      </div>
                      <Skeleton.Button
                        active
                        size="large"
                        style={{
                          width: "100%",
                          height: 40,
                          borderRadius: 12,
                          marginTop: 16,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div
            className={
              warehousesLoading || inventoryLoading
                ? "pointer-events-none opacity-50"
                : ""
            }
          >
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
                  <div className="text-center py-8 text-gray-500">
                    Loading products...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search
                      ? "No products found matching your search"
                      : "No products available in this warehouse"}
                  </div>
                ) : (
                  <ProductGrid
                    products={filteredProducts}
                    onAdd={handleAddToCart}
                    selectedWarehouse={selectedWarehouse}
                  />
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
                  setDiscount={(v) => {
                    if (v > subtotal) {
                      error("Discount cannot exceed subtotal");
                      return;
                    }
                    setDiscount(v);
                  }}
                  total={total}
                  setCustomTotal={setCustomTotal}
                  computedTotal={computedTotal}
                  customers={customerOptions}
                  onCreateCustomer={() => setCustomerModalOpen(true)}
                  onCheckoutSuccess={handleCheckoutSuccess}
                  onOrderCompleted={handleOrderCompleted}
                  selectedWarehouse={selectedWarehouse}
                  products={products}
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
        {/* Removed Modal for warehouse switch as it's tied to the print container */}
      </div>
    </>
  );
}
