import React, { useState } from "react";
import { Table, Button, Space, Popconfirm, Tag, Input } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useGetVendorsQuery, useDeleteVendorMutation } from "./api";
import { Vendor } from "./types";
import { useNotification } from "@/hooks/useNotification";
import { useModal } from "@/hooks/useModal";
import AddEditVendorDrawer from "./AddEditVendorDrawer";

const { Search } = Input;

const VendorTable: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { success, error } = useNotification();
  const { open, close, isOpen } = useModal("vendor-drawer");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const { data: vendorsResponse, isLoading, refetch } = useGetVendorsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchText,
  });

  const [deleteVendor] = useDeleteVendorMutation();

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    open(vendor);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteVendor(id).unwrap();
      success("Vendor deleted successfully");
      refetch();
    } catch (err) {
      error("Failed to delete vendor");
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

  const columns = [
    {
      title: "Vendor Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Vendor) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this vendor?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Vendors</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Vendor
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Search
          placeholder="Search vendors..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          className="max-w-md"
        />
      </div>

      <Table
        columns={columns}
        dataSource={vendorsResponse?.data || []}
        loading={isLoading}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: vendorsResponse?.pagination?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
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