"use client";
import { useState } from "react";
import { Card, Form, Input, Select, DatePicker, Button, Space } from "antd";
import { useGetOutletsQuery } from "@/features/outlets/api";

const { RangePicker } = DatePicker;

interface DemandFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    outletFilter: string;
    warehouseFilter: string;
    statusFilter: string;
    startDate: string;
    endDate: string;
  }) => void;
}

export default function DemandFilters({ onFiltersChange }: DemandFiltersProps) {
  const [form] = Form.useForm();
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch outlets for dropdown
  const { data: outletsData } = useGetOutletsQuery({
    page: 1,
    limit: 1000,
    sortBy: "name",
    sortOrder: "asc",
  });

  const handleSubmit = (values: any) => {
    const filters = {
      search: values.search || "",
      outletFilter: values.outletId || "",
      warehouseFilter: values.warehouseId || "",
      statusFilter: values.status || "",
      startDate: values.dateRange?.[0]?.format("YYYY-MM-DD") || "",
      endDate: values.dateRange?.[1]?.format("YYYY-MM-DD") || "",
    };
    onFiltersChange(filters);
  };

  const handleReset = () => {
    form.resetFields();
    onFiltersChange({
      search: "",
      outletFilter: "",
      warehouseFilter: "",
      statusFilter: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <Card className="mb-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Form.Item name="search" label="Search">
            <Input placeholder="Search by demand ID..." />
          </Form.Item>

          <Form.Item name="outletId" label="Outlet">
            <Select
              placeholder="Select outlet"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {outletsData?.data?.map((outlet) => (
                <Select.Option key={outlet._id} value={outlet._id}>
                  {outlet.name} ({outlet.outletId})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="warehouseId" label="Warehouse ID">
            <Input placeholder="Enter warehouse ID" />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select placeholder="Select status" allowClear>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="converted">Converted</Select.Option>
              <Select.Option value="cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="dateRange" label="Demand Date Range">
              <RangePicker
                style={{ width: "100%" }}
                placeholder={["Start Date", "End Date"]}
              />
            </Form.Item>
          </div>
        )}

        <div className="flex justify-between items-center">
          <Space>
            <Button type="primary" htmlType="submit">
              Apply Filters
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </Space>
          <Button
            type="link"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show Less" : "Show More"}
          </Button>
        </div>
      </Form>
    </Card>
  );
} 