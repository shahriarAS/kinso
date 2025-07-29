"use client";
import { Input, Select, Button } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

interface Props {
  searchTerm: string;
  membershipFilter: boolean | undefined;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onMembershipChange: (value: boolean | undefined) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onReset?: () => void;
}

export default function CustomerFilters({
  searchTerm,
  membershipFilter,
  statusFilter,
  onSearchChange,
  onMembershipChange,
  onStatusChange,
  onPageChange,
  onReset,
}: Props) {
  const handleSearch = (value: string) => {
    onSearchChange(value);
    onPageChange(1);
  };

  const handleMembershipFilter = (value: boolean | undefined) => {
    onMembershipChange(value);
    onPageChange(1);
  };

  const handleStatusFilter = (value: string) => {
    onStatusChange(value);
    onPageChange(1);
  };

  const handleReset = () => {
    onSearchChange("");
    onMembershipChange(undefined);
    onStatusChange("");
    onPageChange(1);
    if (onReset) onReset();
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FilterOutlined className="mr-2" />
          Customer Filters
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
            placeholder="Search customers..."
            prefix={<SearchOutlined />}
            size="large"
            allowClear
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onPressEnter={(e) =>
              handleSearch((e.target as HTMLInputElement).value)
            }
          />
        </div>

        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Membership Status
          </label>
          <Select
            placeholder="Filter by membership"
            allowClear
            size="large"
            style={{ width: "100%" }}
            onChange={handleMembershipFilter}
            value={membershipFilter}
          >
            <Option value={true}>Active Members</Option>
            <Option value={false}>Non-Members</Option>
          </Select>
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
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="premium">Premium</Option>
            <Option value="regular">Regular</Option>
          </Select>
        </div> */}
      </div>
    </div>
  );
}
