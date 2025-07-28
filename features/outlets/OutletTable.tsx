import React, { useState } from "react";
import { Button, Input, Select } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useGetOutletsQuery, useDeleteOutletMutation } from "./api";
import { Outlet } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import AddEditOutletDrawer from "./AddEditOutletDrawer";
import { useDebounce } from "@/hooks/useDebounce";
import { OUTLET_TYPES } from "@/types";
import {
  GenericTable,
  type TableColumn,
  type TableAction,
} from "@/components/common";

const { Search } = Input;
const { Option } = Select;

const OutletTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const { success, error: notifyError } = useNotification();
  const { open, close, isOpen } = useModal("outlet-drawer");
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);

  const {
    data: outletsResponse,
    isLoading,
    error,
    refetch,
  } = useGetOutletsQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchText,
    type: selectedTypeId,
  });

  const [deleteOutlet, { isLoading: isDeleting }] = useDeleteOutletMutation();

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setSelectedTypeId(value);
    setCurrentPage(1);
  };

  const handleEdit = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
    open(outlet);
  };

  const handleDelete = async (outlet: Outlet) => {
    try {
      await deleteOutlet(outlet._id).unwrap();
      success("Outlet deleted successfully");
      refetch();
    } catch (err) {
      notifyError("Failed to delete outlet");
    }
  };

  const handleAdd = () => {
    setSelectedOutlet(null);
    open();
  };

  const handleDrawerClose = () => {
    close();
    setSelectedOutlet(null);
    refetch();
  };

  const columns: TableColumn<Outlet>[] = [
    {
      title: "Outlet Name",
      dataIndex: "name",
      key: "name",
      // sorter: true,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
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

  const actions: TableAction<Outlet>[] = [
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
        title: "Are you sure you want to delete this outlet?",
        description: "This action cannot be undone.",
      },
      loading: isDeleting,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Outlets</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Outlet
        </Button>
      </div>

      <div className="flex justify-between items-center space-x-4">
        <Search
          placeholder="Search outlets..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={e => handleSearch(e.target.value)}
          value={searchText}
          className="flex-1 max-w-md"
        />
        <Select
          placeholder="Filter by type"
          allowClear
          style={{ width: 200 }}
          onChange={handleTypeFilter}
          value={selectedTypeId || undefined}
        >
          {OUTLET_TYPES.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </div>

      <GenericTable<Outlet>
        data={outletsResponse?.data || []}
        loading={isLoading}
        error={error}
        onRetry={refetch}
        columns={columns}
        actions={actions}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: outletsResponse?.pagination?.total || 0,
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

      <AddEditOutletDrawer
        open={isOpen}
        onClose={handleDrawerClose}
        outlet={selectedOutlet}
      />
    </div>
  );
};

export default OutletTable; 