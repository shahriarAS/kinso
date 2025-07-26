"use client";
import { useState } from "react";
import { Card, Button, Space, Typography } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  DemandTable,
  DemandFilters,
  AddEditDemandDrawer,
  DemandGenerationModal,
} from "@/features/demand/components";
import { useNotification } from "@/hooks/useNotification";

const { Title } = Typography;

export default function DemandPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    outletFilter: "",
    warehouseFilter: "",
    statusFilter: "",
    startDate: "",
    endDate: "",
  });

  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const { success } = useNotification();

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateSuccess = () => {
    setShowCreateDrawer(false);
    success("Demand created successfully");
  };

  const handleGenerationSuccess = () => {
    setShowGenerationModal(false);
    success("Demands generated successfully");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={2} className="!mb-0">
            Demand Management
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateDrawer(true)}
            >
              Create Demand
            </Button>
            <Button
              type="default"
              onClick={() => setShowGenerationModal(true)}
            >
              Generate from Sales
            </Button>
          </Space>
        </div>

        <Card className="mb-4">
          <div className="text-gray-600">
            <p className="mb-2">
              <strong>Demand Management</strong> allows you to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Create and manage product demands for outlets and warehouses</li>
              <li>Generate demands automatically based on sales data analysis</li>
              <li>Convert approved demands to stock inventory</li>
              <li>Track demand status through the approval workflow</li>
              <li>Filter and search demands by various criteria</li>
            </ul>
          </div>
        </Card>
      </div>

      <DemandFilters onFiltersChange={handleFiltersChange} />

      <Card>
        <DemandTable
          searchTerm={filters.search}
          outletFilter={filters.outletFilter}
          warehouseFilter={filters.warehouseFilter}
          statusFilter={filters.statusFilter}
          startDate={filters.startDate}
          endDate={filters.endDate}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </Card>

      {/* Modals and Drawers */}
      <AddEditDemandDrawer
        open={showCreateDrawer}
        demand={null}
        onClose={() => setShowCreateDrawer(false)}
      />

      <DemandGenerationModal
        open={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onSuccess={handleGenerationSuccess}
      />
    </div>
  );
} 