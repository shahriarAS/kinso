"use client";
import { useState } from "react";
import AddEditProductDrawer from "@/features/products/AddEditProductDrawer";
import ProductFilters from "@/features/products/ProductFilters";
import ProductTable from "@/features/products/ProductTable";
import { Button } from "antd";
import { Icon } from "@iconify/react";

export default function ProductsPage() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  return (
    <div className="h-full w-full p-6 relative overflow-x-hidden flex flex-col gap-10">
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <h1 className="text-4xl font-semibold">Products</h1>
        <Button onClick={() => setOpen(true)} size="large" type="primary">
          <Icon icon="mdi:plus" />
          Add Product
        </Button>
      </div>
      <AddEditProductDrawer
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
      />

      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        brandFilter={brandFilter}
        vendorFilter={vendorFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onSearchChange={setSearchTerm}
        onCategoryChange={setCategoryFilter}
        onBrandChange={setBrandFilter}
        onVendorChange={setVendorFilter}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onPageChange={setCurrentPage}
      />

      {/* Table */}
      <ProductTable
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        brandFilter={brandFilter}
        vendorFilter={vendorFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
