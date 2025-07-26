import React from "react";
import { Form, Input, Select, DatePicker, Checkbox, Button } from "antd";
import { SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useGetProductsQuery } from "@/features/products/api";
import { useGetOutletsQuery } from "@/features/outlets/api";
import { useGetWarehousesQuery } from "@/features/warehouses/api";
import { StockFilters as StockFiltersType } from "../types";

interface StockFiltersProps {
  filters: StockFiltersType;
  onFiltersChange: (filters: StockFiltersType) => void;
  onReset: () => void;
}

const StockFilters: React.FC<StockFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [form] = Form.useForm();

  const { data: productsData } = useGetProductsQuery({ limit: 1000 });
  const { data: outletsData } = useGetOutletsQuery({ limit: 1000 });
  const { data: warehousesData } = useGetWarehousesQuery({ limit: 1000 });

  const handleValuesChange = (_: any, allValues: any) => {
    const formattedValues = {
      ...allValues,
      expireDateFrom: allValues.expireDateFrom?.format("YYYY-MM-DD"),
      expireDateTo: allValues.expireDateTo?.format("YYYY-MM-DD"),
      entryDateFrom: allValues.entryDateFrom?.format("YYYY-MM-DD"),
      entryDateTo: allValues.entryDateTo?.format("YYYY-MM-DD"),
    };
    onFiltersChange(formattedValues);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FilterOutlined className="mr-2" />
          Stock Filters
        </h3>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          className="flex items-center"
        >
          Reset
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={filters}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Form.Item name="search" label="Search">
          <Input
            placeholder="Search products..."
            prefix={<SearchOutlined />}
            allowClear
          />
        </Form.Item>

        <Form.Item name="productId" label="Product">
          <Select
            placeholder="Select product"
            allowClear
            showSearch
            optionFilterProp="children"
            loading={!productsData}
          >
            {productsData?.data?.map((product) => (
              <Select.Option key={product._id} value={product._id}>
                {product.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="outletId" label="Outlet">
          <Select
            placeholder="Select outlet"
            allowClear
            showSearch
            optionFilterProp="children"
            loading={!outletsData}
          >
            {outletsData?.data?.map((outlet) => (
              <Select.Option key={outlet._id} value={outlet._id}>
                {outlet.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="warehouseId" label="Warehouse">
          <Select
            placeholder="Select warehouse"
            allowClear
            showSearch
            optionFilterProp="children"
            loading={!warehousesData}
          >
            {warehousesData?.data?.map((warehouse) => (
              <Select.Option key={warehouse._id} value={warehouse.warehouseId}>
                {warehouse.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="expireDateFrom" label="Expire Date From">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Start date"
          />
        </Form.Item>

        <Form.Item name="expireDateTo" label="Expire Date To">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="End date"
          />
        </Form.Item>

        <Form.Item name="entryDateFrom" label="Entry Date From">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Start date"
          />
        </Form.Item>

        <Form.Item name="entryDateTo" label="Entry Date To">
          <DatePicker
            style={{ width: "100%" }}
            placeholder="End date"
          />
        </Form.Item>

        <div className="flex items-end space-x-4">
          <Form.Item name="lowStock" valuePropName="checked" className="mb-0">
            <Checkbox>Low Stock Only</Checkbox>
          </Form.Item>

          <Form.Item name="expiringSoon" valuePropName="checked" className="mb-0">
            <Checkbox>Expiring Soon</Checkbox>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default StockFilters; 