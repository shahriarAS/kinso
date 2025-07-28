import React, { useState } from "react";
import { Button, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
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

  const handleReset = () => {
    setSearchText("");
    setSelectedApplyVAT(undefined);
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

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FilterOutlined className="mr-2" />
            Category Filters
          </h3>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            className="flex items-center"
          >
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              placeholder="Search categories..."
              prefix={<SearchOutlined />}
              size="large"
              allowClear
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              onPressEnter={e => handleSearch((e.target as HTMLInputElement).value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply VAT
            </label>
            <Select
              placeholder="Filter by apply VAT"
              allowClear
              size="large"
              style={{ width: "100%" }}
              onChange={handleApplyVATFilter}
              value={selectedApplyVAT}
            >
              <Option value={true}>Yes</Option>
              <Option value={false}>No</Option>
            </Select>
          </div>
        </div>
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