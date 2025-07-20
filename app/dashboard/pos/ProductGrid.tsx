"use client";

import { Button, Tooltip, Tag } from "antd";
import { Icon } from "@iconify/react";
import type { Product } from "@/types/product";
import { categoryColors } from "./types";
import { getInitials } from "@/lib/getInitials";

interface ProductGridProps {
  products: Product[];
  onAdd: (p: Product) => void;
}

export default function ProductGrid({ products, onAdd }: ProductGridProps) {
  const getCategoryName = (category: string | { _id: string; name: string }) => {
    if (typeof category === 'string') {
      return category;
    }
    return category.name;
  };

  const getCategoryColor = (category: string | { _id: string; name: string }) => {
    const categoryName = getCategoryName(category).toLowerCase();
    return categoryColors[categoryName] || "bg-gray-200 text-gray-600";
  };

  const getStockQuantity = (product: Product) => {
    return product.stock.reduce((total, stockItem) => total + stockItem.unit, 0);
  };

  const getProductPrice = (product: Product) => {
    // Get the MRP from the first stock item (warehouse inventory)
    const stockItem = product.stock[0];
    return stockItem?.mrp || 0;
  };

  const isLowStock = (quantity: number) => quantity <= 5;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      {products.map((product) => {
        const stockQuantity = getStockQuantity(product);
        const lowStock = isLowStock(stockQuantity);
        const price = getProductPrice(product);
        
        return (
          <div
            key={product._id}
            className="bg-white rounded-xl p-6 min-h-[220px] flex flex-col gap-3 border border-gray-200 hover:border-primary/30 transition-all duration-200 shadow-lg cursor-pointer group relative"
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg font-semibold text-primary/70 border border-gray-100">
                {getInitials(product.name)}
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-semibold text-base text-primary line-clamp-3 leading-tight break-words max-w-full">
                  {product.name}
                </span>
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(product.category)}`}
              >
                {getCategoryName(product.category).charAt(0).toUpperCase() +
                  getCategoryName(product.category).slice(1)}
              </span>
              {lowStock && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-medium border border-red-100">Low</span>
              )}
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl font-semibold text-green-600">
                ৳{price ? price.toFixed(2) : '0.00'}
              </span>
              <span className="text-xs text-gray-400">Stock: {stockQuantity}</span>
            </div>
            <Button
              type="primary"
              size="large"
              className="w-full flex items-center justify-center gap-2 font-semibold !bg-primary hover:!bg-primary/90 !border-primary mt-auto py-3 text-lg rounded-xl"
              onClick={() => onAdd(product)}
              icon={<Icon icon="mdi:cart-plus" className="text-2xl" />}
              disabled={stockQuantity === 0}
            >
              {stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            {stockQuantity === 0 && (
              <span className="absolute top-3 right-3 text-xs text-red-400 font-medium bg-red-50 px-2 py-0.5 rounded-full border border-red-100">Out of Stock</span>
            )}
          </div>
        );
      })}
    </div>
  );
} 