"use client";
import { Input, Select, Button } from "antd";
import { SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

interface Props {
  searchTerm: string;
  statusFilter: string;
  locationTypeFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onLocationTypeChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onReset?: () => void;
}

function DemandFilters({
  searchTerm,
  statusFilter,
  locationTypeFilter,
  onSearchChange,
  onStatusChange,
  onLocationTypeChange,
  onPageChange,
  onReset,
}: Props) {
  const handleSearch = (value: string) => {
    onSearchChange(value);
    onPageChange(1);
  };

  const handleStatusFilter = (value: string) => {
    onStatusChange(value);
    onPageChange(1);
  };

  const handleLocationTypeFilter = (value: string) => {
    onLocationTypeChange(value);
    onPageChange(1);
  };

  const handleReset = () => {
    onSearchChange("");
    onStatusChange("");
    onLocationTypeChange("");
    onPageChange(1);
    if (onReset) onReset();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FilterOutlined className="mr-2" />
          Demand Filters
        </h3>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          className="flex items-center"
        >
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <Input
            placeholder="Search demands..."
            prefix={<SearchOutlined />}
            size="large"
            allowClear
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <Select
            placeholder="Filter by status"
            allowClear
            size="large"
            style={{ width: "100%" }}
            onChange={handleStatusFilter}
            value={statusFilter || undefined}
          >
            <Option value="Pending">Pending</Option>
            <Option value="Approved">Approved</Option>
            <Option value="ConvertedToStock">Converted to Stock</Option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Type
          </label>
          <Select
            placeholder="Filter by location type"
            allowClear
            size="large"
            style={{ width: "100%" }}
            onChange={handleLocationTypeFilter}
            value={locationTypeFilter || undefined}
          >
            <Option value="Warehouse">Warehouse</Option>
            <Option value="Outlet">Outlet</Option>
          </Select>
        </div>
      </div>
    </div>
  );
}

export { DemandFilters };
export default DemandFilters;
