"use client";
import { useState, useEffect, useRef } from "react";
import { Input, Select, Skeleton } from "antd";
import { useGetCustomersQuery } from "@/features/customers";
import { useNotification } from "@/hooks/useNotification";
import ProductGrid from "./ProductGrid";
import CartDetails from "./CartDetails";
import CustomerModal from "./CustomerModal";
import { CartItem, CustomerOption } from "./types";
import { useFetchAuthUserQuery } from "@/features/auth";
import { salesApi } from "@/features/sales";
import { outletsApi } from "@/features/outlets";
import { useGetStocksQuery } from "@/features/stock";
import type { Stock } from "@/features/stock/types";
import type { Customer } from "@/features/customers/types";
import toast from "react-hot-toast";

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState(0);
  const [customTotal, setCustomTotal] = useState<string | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<string>("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  
  const { data: userData } = useFetchAuthUserQuery();
  const [createSale] = salesApi.useCreateSaleMutation();
  const { data: outletsData } = outletsApi.useGetOutletsQuery({ limit: 100 });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useNotification();

  const { data: customersData } = useGetCustomersQuery({
    limit: 100,
  });

  // Get stock data for the selected outlet
  const { data: stockData, isLoading: stockLoading, refetch: refetchStock } = useGetStocksQuery({
    limit: 10000,
    location: selectedOutlet || undefined,
    locationType: "Outlet",
  });

  // Prepare customer options
  const customerOptions: CustomerOption[] = [
    { label: "Select A Customer", value: "", disabled: true },
    ...(customersData?.data?.map((customer: Customer) => ({
      label: customer.name,
      value: customer._id,
      _id: customer._id,
    })) || []),
  ];

  // Get stocks from API response
  const stocks: Stock[] = stockData?.data || [];

  // Filter stocks based on search
  const filteredStocks = stocks.filter((stock) => {
    if (!stock.product) return false;
    const product = stock.product;
    return (
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(search.toLowerCase()) ||
      ""
    );
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const computedTotal = subtotal - discount;
  const total = customTotal !== null && customTotal !== "" ? Number(customTotal) : computedTotal;

  // Handle adding stock item to cart
  const handleAddToCart = (stock: Stock) => {
    if (!stock.product || stock.unit <= 0) return;
    
    setCart((prev) => {
      const found = prev.find((item) => item.stockId === stock._id);
      if (found) {
        // Cap at max stock
        const newQty = Math.min(found.quantity + 1, stock.unit);
        return prev.map((item) =>
          item.stockId === stock._id
            ? { ...item, quantity: newQty }
            : item,
        );
      }
      
      // Create new cart item with stock information
      const newCartItem: CartItem = {
        _id: stock.product._id,
        stockId: stock._id,
        name: stock.product.name,
        barcode: stock.product.barcode || "",
        quantity: 1,
        price: stock.mrp,
        availableStock: stock.unit,
        category: typeof stock.product.category === 'object' ? stock.product.category?.name : undefined,
        brand: typeof stock.product.brand === 'object' ? stock.product.brand?.name : undefined,
        batchNumber: stock.batchNumber,
        expireDate: stock.expireDate,
      };
      
      return [...prev, newCartItem];
    });
  };

  // Handle quantity change
  const handleQtyChange = (stockId: string, qty: number) => {
    const cartItem = cart.find((item) => item.stockId === stockId);
    if (!cartItem) return;
    
    const maxQty = cartItem.availableStock;
    setCart((prev) =>
      prev.map((item) =>
        item.stockId === stockId
          ? { ...item, quantity: Math.max(1, Math.min(qty, maxQty)) }
          : item,
      ),
    );
  };

  const handlePriceChange = (stockId: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.stockId === stockId ? { ...item, price: Math.max(0, price) } : item,
      ),
    );
  };

  const handleRemoveFromCart = (stockId: string) => {
    setCart((prev) => prev.filter((item) => item.stockId !== stockId));
  };

  const handleCustomerCreated = (newCustomer: { _id: string; name: string; value: string }) => {
    setCustomer(newCustomer.value);
    success(`Customer ${newCustomer.name} created and selected!`);
  };

  const handleCheckoutSuccess = () => {
    setCart([]);
    setDiscount(0);
    setCustomTotal(null);
    setCustomer("");
    success("Sale completed! Cart cleared and ready for next sale.");
    refetchStock(); // Refetch stock after sale
    // Refocus search bar
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleSaleComplete = async (saleData: {
    outletId: string;
    customerId?: string;
    paymentMethods: { method: string; amount: number }[];
    notes?: string;
  }) => {
    try {
      if (!selectedOutlet) {
        error("Please select an outlet");
        return;
      }

      const saleItems = cart.map(item => ({
        stock: item.stockId, // Use stock ID as required by the API
        quantity: item.quantity,
        unitPrice: item.price,
        discountApplied: 0, // Individual item discounts if needed
      }));

      const discountAmount = Math.max(0, subtotal - total);

      const salePayload = {
        outlet: selectedOutlet,
        customer: saleData.customerId || undefined,
        items: saleItems,
        paymentMethods: saleData.paymentMethods.map(pm => ({
          method: pm.method as any,
          amount: pm.amount
        })),
        discountAmount,
        notes: saleData.notes,
      };

      await createSale(salePayload).unwrap();

      toast.success("Sale completed successfully!");
      handleCheckoutSuccess();
    } catch (error: any) {
      toast.error("Failed to complete sale");
      console.error("Sale completion error:", error);
    }
  };

  // Focus search bar on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Initialize outlet selection
  useEffect(() => {
    if (outletsData?.data && outletsData.data.length > 0) {
      if (localStorage.getItem("selectedOutlet")) {
        setSelectedOutlet(localStorage.getItem("selectedOutlet") || "");
      } else {
        setSelectedOutlet(outletsData.data[0]._id);
        localStorage.setItem("selectedOutlet", outletsData.data[0]._id);
      }
    }
  }, [outletsData]);

  return (
    <>
      {/* No modal or PDFDownloadLink needed */}
      <div className="h-full w-full p-6 px-4 relative overflow-x-hidden flex flex-col gap-4 bg-secondary rounded-3xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Point of Sale
          </h1>
          <div className="flex gap-4">
            <Select
              size="large"
              options={outletsData?.data?.map(outlet => ({
                label: outlet.name,
                value: outlet._id,
              })) || []}
              value={selectedOutlet}
              onChange={(value) => {
                setSelectedOutlet(value);
                localStorage.setItem("selectedOutlet", value);
              }}
              className="w-52"
              placeholder="Select Outlet"
            />
          </div>
        </div>
        <div className="relative">
          {stockLoading && (
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
              stockLoading
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
                  />
                </div>
                {stockLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading products...
                  </div>
                ) : filteredStocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {search
                      ? "No products found matching your search"
                      : "No products available in this outlet"}
                  </div>
                ) : (
                  <ProductGrid
                    stocks={filteredStocks}
                    onAdd={handleAddToCart}
                    selectedOutlet={selectedOutlet}
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
                  onSaleComplete={handleSaleComplete}
                  outlets={outletsData?.data || []}
                  selectedOutlet={selectedOutlet}
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
        {/* Modal components */}
      </div>
    </>
  );
}
