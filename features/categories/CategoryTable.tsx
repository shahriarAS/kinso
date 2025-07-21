"use client";

import { useState } from "react";
import { Category } from "@/features/categories/types";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "@/features/categories/api";
import AddEditCategoryDrawer from "./AddEditCategoryDrawer";
import { useNotification } from "@/hooks/useNotification";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";

interface Props {
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CategoryTable({
  searchTerm,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { success, error: showError } = useNotification();

  // API hooks
  const { data, isLoading, error, refetch } = useGetCategoriesQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
  });

  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategory(category._id).unwrap();
      success("Category deleted successfully");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
      ) {
        showError("Failed to delete category", (error.data as { message: string }).message);
      } else {
        showError("Failed to delete category");
      }
    }
  };

  // Define columns using the generic interface
  const columns: TableColumn<Category>[] = [
    {
      title: <span className="font-medium text-base">Name</span>,
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <span className="font-medium text-gray-900">{text}</span>
      ),
    },
    {
      title: <span className="font-medium text-base">Description</span>,
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <span className="text-gray-700">{text || "-"}</span>
      ),
    },
  ];

  // Define actions using the generic interface
  const actions: TableAction<Category>[] = [
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
        title: "Delete Category",
        description: "Are you sure you want to delete this category?",
      },
      loading: isDeleting,
    },
  ];

  const categories = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <GenericTable
        data={categories}
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
      <AddEditCategoryDrawer
        open={!!editingCategory}
        setOpen={() => setEditingCategory(null)}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
      />
    </>
  );
}
