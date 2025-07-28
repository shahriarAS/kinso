"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Descriptions } from "antd";
import React from "react";
import { Product } from "@/features/products/types";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  product?: Product | null;
  onClose?: () => void;
}

export default function ViewProductDrawer({
  open,
  setOpen,
  product,
  onClose,
}: Props) {
  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <Icon icon="lineicons:eye" className="text-blue-500 text-xl" />
          <span className="text-lg font-medium">Product Details</span>
        </div>
      }
      open={open}
      onClose={handleClose}
      width={600}
      footer={
        <div className="flex justify-end">
          <Button onClick={handleClose} size="large">
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Basic Information
          </h3>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Product Name">
              <span className="font-medium">{product.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Barcode">
              <span className="font-mono text-gray-700">{product.barcode}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Vendor">
              <span className="capitalize">
                {typeof product.vendor === "string" 
                  ? product.vendor 
                  : product.vendor.name}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Brand">
              <span className="capitalize">
                {typeof product.brand === "string" 
                  ? product.brand 
                  : product.brand.name}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              <span className="capitalize">
                {typeof product.category === "string" 
                  ? product.category 
                  : product.category.name}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              <span className="text-gray-600">
                {new Date(product.createdAt).toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              <span className="text-gray-600">
                {new Date(product.updatedAt).toLocaleString()}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </Drawer>
  );
}
