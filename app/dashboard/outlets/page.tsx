"use client";

import React, { useState } from "react";
import { Button, Input, Space, Card, Row, Col, Statistic } from "antd";
import { PlusOutlined, SearchOutlined, ShopOutlined } from "@ant-design/icons";
import OutletTable from "@/features/outlets/OutletTable";
import AddEditOutletDrawer from "@/features/outlets/AddEditOutletDrawer";
import ViewOutletDrawer from "@/features/outlets/ViewOutletDrawer";
import { Outlet } from "@/features/outlets/types";
import { useGetOutletStatsQuery } from "@/features/outlets/api";
import { useDebounce } from "@/hooks/useDebounce";

const { Search } = Input;

const OutletsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: statsData } = useGetOutletStatsQuery();

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleAdd = () => {
    setSelectedOutlet(null);
    setDrawerVisible(true);
  };

  const handleEdit = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
    setDrawerVisible(true);
  };

  const handleView = (outlet: Outlet) => {
    setSelectedOutlet(outlet);
    setViewDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedOutlet(null);
  };

  const handleViewDrawerClose = () => {
    setViewDrawerVisible(false);
    setSelectedOutlet(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outlet Management</h1>
          <p className="text-gray-600">Manage your retail outlets and their inventory</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Add Outlet
        </Button>
      </div>

      {/* Statistics Cards */}
      {statsData && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Outlets"
                value={statsData.data.totalOutlets}
                prefix={<ShopOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={statsData.data.totalProducts}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Value"
                value={statsData.data.totalValue}
                precision={2}
                prefix="$"
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Low Stock Items"
                value={statsData.data.lowStockProducts}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Search
            placeholder="Search outlets by name or ID..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            className="max-w-md"
          />
        </div>

        {/* Outlet Table */}
        <OutletTable
          onEdit={handleEdit}
          onView={handleView}
          searchTerm={debouncedSearchTerm}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </Card>

      {/* Add/Edit Drawer */}
      <AddEditOutletDrawer
        visible={drawerVisible}
        onClose={handleDrawerClose}
        outlet={selectedOutlet}
        onSuccess={() => {
          // Refresh the table
          setCurrentPage(1);
        }}
      />

      {/* View Drawer */}
      <ViewOutletDrawer
        visible={viewDrawerVisible}
        onClose={handleViewDrawerClose}
        outlet={selectedOutlet}
      />
    </div>
  );
};

export default OutletsPage; 