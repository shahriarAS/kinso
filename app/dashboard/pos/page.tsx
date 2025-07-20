"use client";;
import { useState, useEffect, useRef } from "react";
import type { Product } from "@/types/product";
import { Input, Select, message } from "antd";
import { useGetWarehousesQuery } from "@/store/api/warehouses";
import { useGetCustomersQuery } from "@/store/api/customers";
import { useGetWarehouseInventoryQuery } from "@/store/api/warehouses";
import ProductGrid from "./ProductGrid";
import CartDetails from "./CartDetails";
import CustomerModal from "./CustomerModal";
import { CartItem, DEFAULT_UNIT_PRICE, CustomerOption, WarehouseOption } from "./types";
import InvoiceTemplate from "./InvoiceTemplate";
import type { InvoiceData } from "./InvoiceTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const { data: inventoryData, isLoading: inventoryLoading } = useGetWarehouseInventoryQuery(
    selectedWarehouse,
    { skip: !selectedWarehouse }
  );

  // Set default warehouse when warehouses load
  useEffect(() => {
    if (warehousesData?.data && warehousesData.data.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehousesData.data[0]._id);
    }
  }, [warehousesData, selectedWarehouse]);

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
  const products: Product[] = inventoryData?.data?.products.map((item: any) => ({
    _id: item.product._id,
    name: item.product.name,
    upc: item.product.upc,
    category: item.product.category,
    stock: [{
      warehouse: inventoryData.data.warehouse,
      unit: item.quantity,
      dp: item.dp,
      mrp: item.mrp,
    }],
  })) || [];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.upc.includes(search)
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
          options={warehouseOptions}
          value={selectedWarehouse}
          onChange={setSelectedWarehouse}
          className="w-52"
          placeholder="Select Warehouse"
          loading={warehousesLoading}
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

      <CustomerModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
    </>
  );
}