"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Input, Select } from "antd";
import { pdf } from "@react-pdf/renderer";
import { useGetCustomersQuery } from "@/features/customers";
import { useNotification } from "@/hooks/useNotification";
import ProductGrid from "./ProductGrid";
import CartDetails from "./CartDetails";
import CustomerModal from "./CustomerModal";
import POSLoadingSkeleton from "./POSLoadingSkeleton";
import { useFetchAuthUserQuery } from "@/features/auth";
import { salesApi } from "@/features/sales";
import { outletsApi } from "@/features/outlets";
import { useGetStocksQuery } from "@/features/stock";
import { useGetSettingsQuery } from "@/features/settings/api";
import type { Stock } from "@/features/stock/types";
import type { Customer } from "@/features/customers/types";
import type { CartItem, CustomerOption } from "./types";
import toast from "react-hot-toast";
import InvoicePDF from "@/components/common/InvoicePDF";
import { mapSaleToInvoiceData } from "@/lib/invoiceUtils";

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
  const { data: settingsData } = useGetSettingsQuery();
  const searchInputRef = useRef<any>(null);
  const { success, error } = useNotification();

  const { data: customersData } = useGetCustomersQuery({
    limit: 100,
  });

  // Get stock data for the selected outlet
  const {
    data: stockData,
    isLoading: stockLoading,
    refetch: refetchStock,
  } = useGetStocksQuery({
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

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const computedTotal = subtotal - discount;
  const total =
    customTotal !== null && customTotal !== ""
      ? Number(customTotal)
      : computedTotal;

  // Handle adding stock item to cart
  const handleAddToCart = (stock: Stock) => {
    if (!stock.product || stock.unit <= 0) return;

    setCart((prev) => {
      const found = prev.find((item) => item.stock === stock._id);
      if (found) {
        // Cap at max stock
        const newQty = Math.min(found.quantity + 1, stock.unit);
        return prev.map((item) =>
          item.stock === stock._id ? { ...item, quantity: newQty } : item,
        );
      }

      // Create new cart item with stock information
      const newCartItem: CartItem = {
        _id: stock.product._id,
        stock: stock._id,
        name: stock.product.name,
        barcode: stock.product.barcode || "",
        quantity: 1,
        price: stock.mrp,
        availableStock: stock.unit,
        category:
          typeof stock.product.category === "object"
            ? stock.product.category?.name
            : undefined,
        brand:
          typeof stock.product.brand === "object"
            ? stock.product.brand?.name
            : undefined,
        batchNumber: stock.batchNumber,
        expireDate: stock.expireDate,
      };

      return [...prev, newCartItem];
    });
  };

  // Handle quantity change
  const handleQtyChange = (stock: string, qty: number) => {
    const cartItem = cart.find((item) => item.stock === stock);
    if (!cartItem) return;

    const maxQty = cartItem.availableStock;
    setCart((prev) =>
      prev.map((item) =>
        item.stock === stock
          ? { ...item, quantity: Math.max(1, Math.min(qty, maxQty)) }
          : item,
      ),
    );
  };

  const handlePriceChange = (stock: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.stock === stock ? { ...item, price: Math.max(0, price) } : item,
      ),
    );
  };

  const handleRemoveFromCart = (stock: string) => {
    setCart((prev) => prev.filter((item) => item.stock !== stock));
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
    success("Sale completed! Cart cleared and ready for next sale.");
    refetchStock(); // Refetch stock after sale
    // Refocus search bar
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Download invoice PDF function
  const downloadInvoicePDF = useCallback(
    async (saleId: string) => {
      if (!saleId || !settingsData) {
        toast.error("Sale ID or settings not found");
        return;
      }
      try {
        // Fetch sale data directly from API
        const response = await fetch(`/api/sales/${saleId}`);
        const saleRes = await response.json();
        if (!saleRes?.data) {
          toast.error("Sale not found");
          return;
        }
        const invoiceData = mapSaleToInvoiceData(
          saleRes.data,
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
        toast.success("Invoice downloaded successfully!");
      } catch (err) {
        toast.error("Failed to download Invoice");
        console.error("Failed to download PDF", err);
      }
    },
    [settingsData, userData],
  );

  const handleSaleComplete = async (saleData: {
    outlet: string;
    customer?: string;
    paymentMethods: { method: string; amount: number }[];
    notes?: string;
  }) => {
    try {
      if (!selectedOutlet) {
        error("Please select an outlet");
        return;
      }

      const saleItems = cart.map((item) => ({
        stock: item.stock, // Use stock ID as required by the API
        quantity: item.quantity,
        unitPrice: item.price,
        discountApplied: 0, // Individual item discounts if needed
      }));

      const discountAmount = Math.max(0, subtotal - total);

      const salePayload = {
        outlet: selectedOutlet,
        customer: saleData.customer || undefined,
        items: saleItems,
        paymentMethods: saleData.paymentMethods.map((pm) => ({
          method: pm.method as any,
          amount: pm.amount,
        })),
        discountAmount,
        notes: saleData.notes,
      };

      const result = await createSale(salePayload).unwrap();

      toast.success("Sale completed successfully!");

      // Download invoice PDF after successful sale
      if (result?.data?.saleId) {
        setTimeout(() => {
          downloadInvoicePDF(result.data!.saleId);
        }, 500); // Small delay to ensure UI updates
      }

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
      <div className="h-full w-full p-6 px-4 relative overflow-x-hidden flex flex-col gap-4 bg-secondary rounded-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Point of Sale
          </h1>
          <div className="flex gap-4">
            <Select
              size="large"
              options={
                outletsData?.data?.map((outlet) => ({
                  label: outlet.name,
                  value: outlet._id,
                })) || []
              }
              value={selectedOutlet}
              onChange={(value) => {
                setSelectedOutlet(value);
                localStorage.setItem("selectedOutlet", value);
                // Clear cart and everything when outlet is changed
                setCart([]);
                setDiscount(0);
                setCustomTotal(null);
                setCustomer("");
                setSearch("");
              }}
              className="w-52"
              placeholder="Select Outlet"
            />
          </div>
        </div>
        <div className="relative">
          {stockLoading && <POSLoadingSkeleton />}
          <div className={stockLoading ? "pointer-events-none opacity-50" : ""}>
            {/* The original grid content */}
            <div className="gap-4 grid grid-cols-5">
              <div className="bg-white p-6 rounded-xl col-span-3">
                <div className="mb-8 flex gap-4 items-center">
                  <Input
                    size="large"
                    placeholder="Search products..."
                    className="w-full rounded-xl border-gray-300"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                    ref={searchInputRef}
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
