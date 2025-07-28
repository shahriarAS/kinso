"use client";
import { useState } from "react";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/features/products";
import type { Product } from "@/features/products/types";
import AddEditProductDrawer from "./AddEditProductDrawer";
import ViewProductDrawer from "./ViewProductDrawer";
import { useNotification } from "@/hooks/useNotification";

interface Props {
  searchTerm: string;
  categoryFilter: string;
  brandFilter: string;
  vendorFilter: string;
  minPrice: string;
  maxPrice: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function ProductTable({
  searchTerm,
  categoryFilter,
  brandFilter,
  vendorFilter,
  minPrice,
  maxPrice,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const { success, error: showError } = useNotification();

  // API hooks
  const { data, isLoading, error, refetch } = useGetProductsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    category: categoryFilter || undefined,
    brand: brandFilter || undefined,
    vendor: vendorFilter || undefined,
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
      success("Product deleted successfully");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        showError(
          "Failed to delete product",
          (error.data as { message: string }).message,
        );
      } else {
        showError("Failed to delete product");
      }
    }
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
      title: <span className="font-medium text-base">Barcode</span>,
      dataIndex: "barcode",
      key: "barcode",
      render: (text: string) => (
        <span className="text-gray-700 font-mono">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Vendor</span>,
      dataIndex: "vendor",
      key: "vendor",
      render: (vendor: { _id: string; name: string }) => {
        const vendorName = vendor?.name || "";
        return <span className="text-gray-700 capitalize">{vendorName}</span>;
      },
    },
    {
      title: <span className="font-medium text-base">Brand</span>,
      dataIndex: "brand",
      key: "brand",
      render: (brand: { _id: string; name: string }) => {
        const brandName = brand?.name || "";
        return <span className="text-gray-700 capitalize">{brandName}</span>;
      },
    },
    {
      title: <span className="font-medium text-base">Category</span>,
      dataIndex: "category",
      key: "category",
      render: (category: { _id: string; name: string }) => {
        const categoryName = category?.name || "";
        return <span className="text-gray-700 capitalize">{categoryName}</span>;
      },
    },
    {
      title: <span className="font-medium text-base">Created</span>,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleDateString();
        return <span className="text-gray-600">{formattedDate}</span>;
      },
    },
  ];

  // Define actions using the generic interface
  const actions: TableAction<Product>[] = [
    // {
    //   key: "view",
    //   label: "View Product",
    //   icon: "lineicons:eye",
    //   type: "view",
    //   color: "green",
    //   onClick: handleView,
    // },
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
