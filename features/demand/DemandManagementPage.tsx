"use client";

import React, { useState } from "react";
import { Button, Space, Card, message } from "antd";
import { PlusOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { DemandTable } from "./DemandTable";
import { DemandFilters } from "./DemandFilters";
import { DemandStats } from "./DemandStats";
import { AddEditDemandDrawer } from "./AddEditDemandDrawer";
import { ViewDemandDrawer } from "./ViewDemandDrawer";
import { DemandGenerationDrawer } from "./DemandGenerationDrawer";
import { ConvertDemandDrawer } from "./ConvertDemandDrawer";
import {
  useGetDemandsQuery,
  useCreateDemandMutation,
  useUpdateDemandMutation,
  useDeleteDemandMutation,
  useGenerateDemandsMutation,
  useConvertDemandToStockMutation,
  useUpdateDemandStatusMutation,
} from "./api";
import {
  Demand,
  DemandFiltersTypes,
  DemandInput,
  DemandGenerationRequest,
  DemandConversionRequest,
} from "./types";
import { useNotification } from "@/hooks/useNotification";

export const DemandManagementPage: React.FC = () => {
  // State for filters and pagination
  const [filters, setFilters] = useState<DemandFiltersTypes>({
    page: 1,
    limit: 10,
  });

  // State for drawers
  const [addEditDrawerOpen, setAddEditDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [generateDrawerOpen, setGenerateDrawerOpen] = useState(false);
  const [convertDrawerOpen, setConvertDrawerOpen] = useState(false);

  // State for selected items
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);

  // Hooks
  const { success, error: showError } = useNotification();

  // API hooks
  const {
    data: demandsData,
    isLoading,
    error,
    refetch,
  } = useGetDemandsQuery(filters);
  const [createDemand, { isLoading: isCreating }] = useCreateDemandMutation();
  const [updateDemand, { isLoading: isUpdating }] = useUpdateDemandMutation();
  const [deleteDemand, { isLoading: isDeleting }] = useDeleteDemandMutation();
  const [generateDemands, { isLoading: isGenerating }] =
    useGenerateDemandsMutation();
  const [convertToStock, { isLoading: isConverting }] =
    useConvertDemandToStockMutation();

  const demands = demandsData?.data || [];

  // Handlers
  const handleFiltersChange = (newFilters: DemandFiltersTypes) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const handleCreateDemand = () => {
    setSelectedDemand(null);
    setAddEditDrawerOpen(true);
  };

  const handleEditDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setAddEditDrawerOpen(true);
  };

  const handleViewDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setViewDrawerOpen(true);
  };

  const handleConvertDemand = (demand: Demand) => {
    setSelectedDemand(demand);
    setConvertDrawerOpen(true);
  };

  const handleSubmitDemand = async (data: DemandInput) => {
    try {
      if (selectedDemand) {
        await updateDemand({ _id: selectedDemand._id, demand: data }).unwrap();
        success("Demand updated successfully");
      } else {
        await createDemand(data).unwrap();
        success("Demand created successfully");
      }
      setAddEditDrawerOpen(false);
      setSelectedDemand(null);
    } catch (error: any) {
      showError(
        selectedDemand ? "Failed to update demand" : "Failed to create demand",
        error?.data?.message || "An error occurred",
      );
    }
  };

  const handleDeleteDemand = async (demand: Demand) => {
    try {
      await deleteDemand(demand._id).unwrap();
      success("Demand deleted successfully");
    } catch (error: any) {
      showError(
        "Failed to delete demand",
        error?.data?.message || "An error occurred",
      );
    }
  };

  const handleApproveDemand = async (demand: Demand) => {
    try {
      await updateDemand({
        _id: demand._id,
        demand: {
          status: "Approved",
        },
      }).unwrap();
      success("Demand approved successfully");
    } catch (error: any) {
      showError(
        "Failed to approve demand",
        error?.data?.message || "An error occurred",
      );
    }
  };

  const handleGenerateDemands = async (data: DemandGenerationRequest) => {
    try {
      const result = await generateDemands(data).unwrap();
      success(`Generated ${result.data?.length || 0} demands successfully`);
      setGenerateDrawerOpen(false);
    } catch (error: any) {
      showError(
        "Failed to generate demands",
        error?.data?.message || "An error occurred",
      );
    }
  };

  const handleConvertToStock = async (
    demandId: string,
    conversionData: DemandConversionRequest,
  ) => {
    try {
      await convertToStock({ demand: demandId, conversionData }).unwrap();
      success("Demand converted to stock successfully");
      setConvertDrawerOpen(false);
      setSelectedDemand(null);
    } catch (error: any) {
      showError(
        "Failed to convert demand to stock",
        error?.data?.message || "An error occurred",
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Demand Management
          </h1>
          <p className="text-gray-600">
            Manage inventory demands and stock conversion
          </p>
        </div>
        <Space>
          <Button
            type="default"
            icon={<ThunderboltOutlined />}
            onClick={() => setGenerateDrawerOpen(true)}
            loading={isGenerating}
          >
            Generate Demand
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateDemand}
          >
            Create Demand
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <DemandStats demands={demands} loading={isLoading} />

      {/* Filters */}
      <DemandFilters
        searchTerm={filters.search || ""}
        statusFilter={filters.status || ""}
        locationTypeFilter={filters.locationType || ""}
        onSearchChange={(value: string) =>
          handleFiltersChange({ search: value })
        }
        onStatusChange={(value: string) =>
          handleFiltersChange({ status: value as any })
        }
        onLocationTypeChange={(value: string) =>
          handleFiltersChange({ locationType: value as any })
        }
        onPageChange={(page: number) => handleFiltersChange({ page })}
        onReset={handleClearFilters}
      />

      {/* Table */}
      <DemandTable
        demands={demands}
        loading={isLoading}
        onEdit={handleEditDemand}
        onDelete={handleDeleteDemand}
        onView={handleViewDemand}
        onConvert={handleConvertDemand}
        onApprove={handleApproveDemand}
      />

      {/* Drawers */}
      <AddEditDemandDrawer
        demand={selectedDemand}
        open={addEditDrawerOpen}
        onClose={() => {
          setAddEditDrawerOpen(false);
          setSelectedDemand(null);
        }}
        onSubmit={handleSubmitDemand}
        loading={isCreating || isUpdating}
      />

      <ViewDemandDrawer
        demand={selectedDemand}
        open={viewDrawerOpen}
        onClose={() => {
          setViewDrawerOpen(false);
          setSelectedDemand(null);
        }}
        onEdit={handleEditDemand}
        onApprove={(id: string) => handleApproveDemand({ _id: id } as Demand)}
        onConvert={handleConvertDemand}
      />

      <DemandGenerationDrawer
        open={generateDrawerOpen}
        onClose={() => setGenerateDrawerOpen(false)}
        onGenerate={handleGenerateDemands}
        loading={isGenerating}
      />

      <ConvertDemandDrawer
        demand={selectedDemand}
        open={convertDrawerOpen}
        onClose={() => {
          setConvertDrawerOpen(false);
          setSelectedDemand(null);
        }}
        onConvert={handleConvertToStock}
        loading={isConverting}
      />
    </div>
  );
};
