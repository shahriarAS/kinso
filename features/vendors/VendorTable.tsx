import React, { useState } from "react";
import { Button, Input } from "antd";
import { PlusOutlined, SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useGetVendorsQuery, useDeleteVendorMutation } from "./api";
import { Vendor } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import AddEditVendorDrawer from "./AddEditVendorDrawer";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";
import { useDebounce } from "@/hooks/useDebounce";

const { Search } = Input;

const VendorTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { success, error: notifyError } = useNotification();
  const { open, close, isOpen } = useModal("vendor-drawer");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const {
    data: vendorsResponse,
    isLoading,
    error,
    refetch,
  } = useGetVendorsQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchText,
  });

  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchText("");
    setCurrentPage(1);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    open(vendor);
  };

  const handleDelete = async (vendor: Vendor) => {
    try {
      await deleteVendor(vendor._id).unwrap();
      success("Vendor deleted successfully");
      refetch();
    } catch (err) {
      notifyError("Failed to delete vendor");
    }
  };

  const handleAdd = () => {
    setSelectedVendor(null);
    open();
  };

  const handleDrawerClose = () => {
    close();
    setSelectedVendor(null);
    refetch();
  };

  const columns: TableColumn<Vendor>[] = [
    {
      title: "Vendor Name",
      dataIndex: "name",
      key: "name",
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

  const actions: TableAction<Vendor>[] = [
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
        title: "Are you sure you want to delete this vendor?",
        description: "This action cannot be undone.",
      },
      loading: isDeleting,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Vendors</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />} // still use AntD icon for button
          onClick={handleAdd}
        >
          Add Vendor
        </Button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FilterOutlined className="mr-2" />
            Vendor Filters
          </h3>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            className="flex items-center"
          >
            Reset
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              placeholder="Search vendors..."
              prefix={<SearchOutlined />}
              size="large"
              allowClear
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
              onPressEnter={e => handleSearch((e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      </div>

      <GenericTable<Vendor>
        data={vendorsResponse?.data || []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: vendorsResponse?.pagination?.total || 0,
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

      <AddEditVendorDrawer
        open={isOpen}
        onClose={handleDrawerClose}
        vendor={selectedVendor}
      />
    </div>
  );
};

export default VendorTable; 