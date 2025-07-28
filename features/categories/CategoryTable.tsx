import React, { useState } from "react";
import { Button, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useGetCategoriesQuery, useDeleteCategoryMutation } from "./api";
import { Category } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import AddEditCategoryDrawer from "./AddEditCategoryDrawer";
import { useDebounce } from "@/hooks/useDebounce";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";

const { Search } = Input;
const { Option } = Select;

const CategoryTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedApplyVAT, setSelectedApplyVAT] = useState<boolean | undefined>(undefined);
  const { success, error: notifyError } = useNotification();
  const { open, close, isOpen } = useModal("category-drawer");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const {
    data: categoriesResponse,
    isLoading,
    error,
    refetch,
  } = useGetCategoriesQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchText,
    applyVAT: selectedApplyVAT,
  });

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleApplyVATFilter = (value: boolean) => {
    setSelectedApplyVAT(value);
    setCurrentPage(1);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    open(category);
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategory(category._id).unwrap();
      success("Category deleted successfully");
      refetch();
    } catch (err) {
      notifyError("Failed to delete category");
    }
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    open();
  };

  const handleDrawerClose = () => {
    close();
    setSelectedCategory(null);
    refetch();
  };

  const columns: TableColumn<Category>[] = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      // sorter: true,
    },
    {
      title: "Apply VAT",
      dataIndex: "applyVAT",
      key: "applyVAT",
      render: (applyVAT: boolean) => applyVAT ? "Yes" : "No",
      // sorter: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      // sorter: true,
    },
  ];

  const actions: TableAction<Category>[] = [
    {
      key: "edit",
      label: "Edit",
      icon: "ant-design:edit-outlined",
      type: "edit",
      color: "blue",
      onClick: handleEdit,
    },
    {
      key: "delete",
      label: "Delete",
      icon: "ant-design:delete-outlined",
      type: "delete",
      color: "red",
      onClick: handleDelete,
      confirm: {
        title: "Are you sure you want to delete this category?",
        description: "This action cannot be undone.",
      },
      loading: isDeleting,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Categories</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Category
        </Button>
      </div>

      <div className="flex justify-between items-center space-x-4">
        <Search
          placeholder="Search categories..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={e => handleSearch(e.target.value)}
          value={searchText}
          className="flex-1 max-w-md"
        />
        <Select
          placeholder="Filter by apply VAT"
          allowClear
          style={{ width: 200 }}
          onChange={handleApplyVATFilter}
          value={selectedApplyVAT || undefined}
        >
          {["Yes", "No"].map((applyVAT) => (
            <Option key={applyVAT} value={applyVAT === "Yes"}>
              {applyVAT === "Yes" ? "Yes" : "No"}
            </Option>
          ))}
        </Select>
      </div>

      <GenericTable<Category>
        data={categoriesResponse?.data || []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: categoriesResponse?.pagination?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size || 10);
          },
        }}
        className="bg-white rounded-lg shadow"
      />

      <AddEditCategoryDrawer
        open={isOpen}
        onClose={handleDrawerClose}
        category={selectedCategory}
      />
    </div>
  );
};

export default CategoryTable; 