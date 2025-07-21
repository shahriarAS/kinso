"use client";
import { Table, Button, Tooltip, Pagination, Popconfirm, Tag } from "antd";
import { Icon } from "@iconify/react";
import { useState } from "react";
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
  warehouseFilter: string;
  statusFilter: string;
  minPrice: string;
  maxPrice: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function InventoryTable({
  searchTerm,
  categoryFilter,
  warehouseFilter,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const { success, error: showError } = useNotification();

  // API hooks
  const { data, isLoading } = useGetProductsQuery({
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

  const handleDelete = async (_id: string) => {
    try {
      await deleteProduct(_id).unwrap();
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
        showError("Failed to delete product", (error.data as { message: string }).message);
      } else {
        showError("Failed to delete product");
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

  const columns = [
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
    {
      title: <span className="font-medium text-base">Action</span>,
      key: "action",
      render: (_: unknown, record: Product) => (
        <div className="flex gap-2">
          <Tooltip title="View Product">
            <Button
              className="inline-flex items-center justify-center rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition p-1.5"
              onClick={() => handleView(record)}
            >
              <Icon icon="lineicons:eye" className="text-lg text-green-700" />
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              className="inline-flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition p-1.5"
              onClick={() => handleEdit(record)}
            >
              <Icon
                icon="lineicons:pencil-1"
                className="text-lg text-blue-700"
              />
            </Button>
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete Product"
              description="Are you sure you want to delete this product?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                className="inline-flex items-center justify-center rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition p-1.5"
                loading={isDeleting}
              >
                <Icon
                  icon="lineicons:trash-3"
                  className="text-lg text-red-600"
                />
              </Button>
            </Popconfirm>
          </Tooltip>
        </div>
      ),
    },
  ];

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div
      className="bg-white border border-gray-300 rounded-3xl shadow-lg overflow-hidden flex flex-col"
      style={{ maxHeight: 600 }}
    >
      <div
        className="overflow-x-auto custom-scrollbar flex-1"
        style={{ maxHeight: 500 }}
      >
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          className="min-w-[700px] !bg-white"
          scroll={{ x: "100%" }}
          pagination={false}
          loading={isLoading}
          sticky
        />
      </div>
      {pagination && (
        <div className="custom-pagination">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={pagination.total}
            onChange={onPageChange}
            showSizeChanger={false}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
          />
        </div>
      )}

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
    </div>
  );
}
