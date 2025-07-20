"use client";
import { useState } from "react";
import { Tag } from "antd";
import { GenericTable, type TableColumn, type TableAction } from "@/components/common";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/features/products";
import type { Product } from "@/features/products/types";
import AddEditProductDrawer from "./AddEditProductDrawer";
import ViewProductDrawer from "./ViewProductDrawer";
import toast from "react-hot-toast";

interface Props {
  searchTerm: string;
  categoryFilter: string;
  warehouseFilter: string;
  statusFilter: string;
  minPrice: string;
  maxPrice: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function ProductTableRefactored({
  searchTerm,
  categoryFilter,
  warehouseFilter,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  // API hooks
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    category: categoryFilter || undefined,
    warehouse: warehouseFilter || undefined,
    sortBy: "name",
    sortOrder: "asc",
  });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product._id).unwrap();
      toast.success("Product deleted successfully");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        toast.error((error.data as { message: string }).message);
      } else {
        toast.error("Failed to delete product");
      }
    }
  };

  const getStockStatus = (stock: Product["stock"]) => {
    const totalStock = stock.reduce((sum, item) => sum + item.unit, 0);
    if (totalStock === 0)
      return { status: "out_of_stock", color: "red", text: "Out of Stock" };
    if (totalStock <= 10)
      return { status: "low_stock", color: "orange", text: "Low Stock" };
    return { status: "in_stock", color: "green", text: "In Stock" };
  };

  const getTotalStock = (stock: Product["stock"]) => {
    return stock.reduce((sum, item) => sum + item.unit, 0);
  };

  // Define columns using the generic interface
  const columns: TableColumn<Product>[] = [
    {
      title: <span className="font-medium text-base">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">SKU</span>,
      dataIndex: "sku",
      key: "sku",
      render: (text: string) => (
        <span className="text-gray-700 font-mono">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">UPC</span>,
      dataIndex: "upc",
      key: "upc",
      render: (text: string) => (
        <span className="text-gray-700 font-mono">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Category</span>,
      dataIndex: "category",
      key: "category",
      render: (category: string | { _id: string; name: string }) => {
        const categoryName =
          typeof category === "string" ? category : category?.name || "";
        return <span className="text-gray-700 capitalize">{categoryName}</span>;
      },
    },
    {
      title: <span className="font-medium text-base">Stock</span>,
      key: "stock",
      render: (_: unknown, record: Product) => {
        const totalStock = getTotalStock(record.stock);
        const stockStatus = getStockStatus(record.stock);
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{totalStock}</span>
            <Tag color={stockStatus.color}>{stockStatus.text}</Tag>
          </div>
        );
      },
    },
  ];

  // Define actions using the generic interface
  const actions: TableAction<Product>[] = [
    {
      key: "view",
      label: "View Product",
      icon: "lineicons:eye",
      type: "view",
      color: "green",
      onClick: handleView,
    },
    {
      key: "edit",
      label: "Edit",
      icon: "lineicons:pencil-1",
      type: "edit",
      color: "blue",
      onClick: handleEdit,
    },
    {
      key: "delete",
      label: "Delete",
      icon: "lineicons:trash-3",
      type: "delete",
      color: "red",
      onClick: handleDelete,
      confirm: {
        title: "Delete Product",
        description: "Are you sure you want to delete this product?",
      },
      loading: isDeleting,
    },
  ];

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <GenericTable
        data={products}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        pagination={
          pagination
            ? {
                current: currentPage,
                pageSize,
                total: pagination.total,
                onChange: onPageChange,
                showSizeChanger: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }
            : undefined
        }
      />

      {/* Edit Drawer */}
      <AddEditProductDrawer
        open={!!editingProduct}
        setOpen={() => setEditingProduct(null)}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
      />

      {/* View Product Drawer */}
      <ViewProductDrawer
        open={!!viewingProduct}
        setOpen={() => setViewingProduct(null)}
        product={viewingProduct}
        onClose={() => setViewingProduct(null)}
      />
    </>
  );
} 