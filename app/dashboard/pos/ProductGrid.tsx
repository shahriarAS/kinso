"use client";

import { Button, Tooltip } from "antd";
import { Icon } from "@iconify/react";
import type { Product } from "@/types/product";
import { categoryColors } from "./types";
import { getInitials } from "./page";

interface ProductGridProps {
  products: Product[];
  onAdd: (p: Product) => void;
}

export default function ProductGrid({ products, onAdd }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white border border-gray-200 rounded-2xl p-7 min-h-[220px] flex flex-col gap-4 shadow-sm hover:shadow-lg transition-shadow duration-200 group relative cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl font-bold text-primary/60 border border-gray-200">
              {getInitials(product.name)}
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-bold text-lg text-primary line-clamp-2 leading-tight break-words">
                {product.name}
              </span>
              <span className="text-xs text-gray-400">UPC: {product.upc}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                categoryColors[product.category] || "bg-gray-200 text-gray-600"
              }`}
            >
              {product.category.charAt(0).toUpperCase() +
                product.category.slice(1)}
            </span>
          </div>
          <Button
            type="primary"
            size="middle"
            className="w-full flex items-center justify-center gap-2 font-semibold !bg-primary hover:!bg-primary/90 !border-primary mt-auto"
            onClick={() => onAdd(product)}
            icon={<Icon icon="mdi:cart-plus" className="text-lg" />}
          >
            Add to Cart
          </Button>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip title="Quick Add">
              <Icon
                icon="mdi:lightning-bolt"
                className="text-yellow-400 text-xl"
              />
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
} 