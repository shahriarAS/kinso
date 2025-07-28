import React, { useState } from "react";
import { Button, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useGetWarehousesQuery, useDeleteWarehouseMutation } from "./api";
import { Warehouse } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import AddEditWarehouseDrawer from "./AddEditWarehouseDrawer";
import { useDebounce } from "@/hooks/useDebounce";
import { OUTLET_TYPES } from "@/types";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";

const { Search } = Input;
const { Option } = Select;

const WarehouseTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const { success, error: notifyError } = useNotification();
  const { open, close, isOpen } = useModal("warehouse-drawer");
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  const {
    data: warehousesResponse,
    isLoading,
    error,
    refetch,
  } = useGetWarehousesQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchText
  });

  const [deleteWarehouse, { isLoading: isDeleting }] = useDeleteWarehouseMutation();

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setSelectedTypeId(value);
    setCurrentPage(1);
  };

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    open(warehouse);
  };

  const handleDelete = async (warehouse: Warehouse) => {
    try {
      await deleteWarehouse(warehouse._id).unwrap();
      success("Warehouse deleted successfully");
      refetch();
    } catch (err) {
      notifyError("Failed to delete warehouse");
    }
  };

  const handleAdd = () => {
    setSelectedWarehouse(null);
    open();
  };

  const handleDrawerClose = () => {
    close();
    setSelectedWarehouse(null);
    refetch();
  };

  const columns: TableColumn<Warehouse>[] = [
    {
      title: "Warehouse Name",
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

  const actions: TableAction<Warehouse>[] = [
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
        title: "Are you sure you want to delete this warehouse?",
        description: "This action cannot be undone.",
      },
      loading: isDeleting,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Warehouses</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Warehouse
        </Button>
      </div>

      <div className="flex justify-between items-center space-x-4">
        <Search
          placeholder="Search warehouses..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={e => handleSearch(e.target.value)}
          value={searchText}
          className="flex-1 max-w-md"
        />
      </div>

      <GenericTable<Warehouse>
        data={warehousesResponse?.data || []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: warehousesResponse?.pagination?.total || 0,
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

      <AddEditWarehouseDrawer
        open={isOpen}
        onClose={handleDrawerClose}
        warehouse={selectedWarehouse}
      />
    </div>
  );
};

export default WarehouseTable; 