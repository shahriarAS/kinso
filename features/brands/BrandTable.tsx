import React, { useState } from "react";
import { Button, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useGetBrandsQuery, useDeleteBrandMutation } from "./api";
import { useGetAllVendorsQuery } from "@/features/vendors/api";
import { Brand } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import AddEditBrandDrawer from "./AddEditBrandDrawer";
import { useDebounce } from "@/hooks/useDebounce";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";

const { Search } = Input;
const { Option } = Select;

const BrandTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const { success, error: notifyError } = useNotification();
  const { open, close, isOpen } = useModal("brand-drawer");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const {
    data: brandsResponse,
    isLoading,
    error,
    refetch,
  } = useGetBrandsQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchText,
    vendor: selectedVendorId,
  });

  const { data: vendorsResponse } = useGetAllVendorsQuery();

  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleVendorFilter = (value: string) => {
    setSelectedVendorId(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchText("");
    setSelectedVendorId("");
    setCurrentPage(1);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    open(brand);
  };

  const handleDelete = async (brand: Brand) => {
    try {
      await deleteBrand(brand._id).unwrap();
      success("Brand deleted successfully");
      refetch();
    } catch (err) {
      notifyError("Failed to delete brand");
    }
  };

  const handleAdd = () => {
    setSelectedBrand(null);
    open();
  };

  const handleDrawerClose = () => {
    close();
    setSelectedBrand(null);
    refetch();
  };

  const columns: TableColumn<Brand>[] = [
    {
      title: "Brand Name",
      dataIndex: "name",
      key: "name",
      // sorter: true,
    },
    {
      title: "Vendor",
      key: "vendorName",
      render: (_, record: Brand) => record.vendor?.name || "N/A",
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

  const actions: TableAction<Brand>[] = [
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
        title: "Are you sure you want to delete this brand?",
        description: "This action cannot be undone.",
      },
      loading: isDeleting,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Brands</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Brand
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FilterOutlined className="mr-2" />
            Brand Filters
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
              placeholder="Search brands..."
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
              Vendor
            </label>
            <Select
              placeholder="Filter by vendor"
              allowClear
              size="large"
              style={{ width: "100%" }}
              onChange={handleVendorFilter}
              value={selectedVendorId || undefined}
            >
              {vendorsResponse?.data?.map((vendor) => (
                <Option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <GenericTable<Brand>
        data={brandsResponse?.data || []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: brandsResponse?.pagination?.total || 0,
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

      <AddEditBrandDrawer
        open={isOpen}
        onClose={handleDrawerClose}
        brand={selectedBrand}
      />
    </div>
  );
};

export default BrandTable; 