import React, { useState } from "react";
import { Drawer, Form, Input, DatePicker, Select, Button, message } from "antd";
import { useAddStockMutation } from "../api";
import { useGetProductsQuery } from "@/features/products/api";
import { useGetOutletsQuery } from "@/features/outlets/api";
import { useGetWarehousesQuery } from "@/features/warehouses/api";
import { StockInput } from "../types";

interface AddStockDrawerProps {
  open: boolean;
  onClose: () => void;
}

const AddStockDrawer: React.FC<AddStockDrawerProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [locationType, setLocationType] = useState<"warehouse" | "outlet">("warehouse");
  const [addStock, { isLoading }] = useAddStockMutation();

  const { data: productsData } = useGetProductsQuery({ limit: 1000 });
  const { data: outletsData } = useGetOutletsQuery({ limit: 1000 });
  const { data: warehousesData } = useGetWarehousesQuery({ limit: 1000 });

  const handleSubmit = async (values: any) => {
    try {
      const stockData: StockInput = {
        productId: values.productId,
        mrp: parseFloat(values.mrp),
        tp: parseFloat(values.tp),
        expireDate: values.expireDate.format("YYYY-MM-DD"),
        units: parseInt(values.units),
        ...(locationType === "outlet" && { outletId: values.locationId }),
        ...(locationType === "warehouse" && { warehouseId: values.locationId }),
      };

      await addStock(stockData).unwrap();
      message.success("Stock added successfully");
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to add stock");
    }
  };

  const handleLocationTypeChange = (value: "warehouse" | "outlet") => {
    setLocationType(value);
    form.setFieldsValue({ locationId: undefined });
  };

  return (
    <Drawer
      title="Add Stock"
      width={600}
      open={open}
      onClose={onClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={() => form.submit()}
          >
            Add Stock
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          locationType: "warehouse",
        }}
      >
        <Form.Item
          name="productId"
          label="Product"
          rules={[{ required: true, message: "Please select a product" }]}
        >
          <Select
            placeholder="Select a product"
            showSearch
            optionFilterProp="children"
            loading={!productsData}
          >
            {productsData?.data?.map((product) => (
              <Select.Option key={product._id} value={product._id}>
                {product.name} ({product.barcode})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="locationType"
          label="Location Type"
          rules={[{ required: true, message: "Please select location type" }]}
        >
          <Select onChange={handleLocationTypeChange}>
            <Select.Option value="warehouse">Warehouse</Select.Option>
            <Select.Option value="outlet">Outlet</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="locationId"
          label={locationType === "warehouse" ? "Warehouse" : "Outlet"}
          rules={[{ required: true, message: `Please select a ${locationType}` }]}
        >
          <Select
            placeholder={`Select a ${locationType}`}
            showSearch
            optionFilterProp="children"
            loading={locationType === "outlet" ? !outletsData : !warehousesData}
          >
            {locationType === "outlet"
              ? outletsData?.data?.map((outlet) => (
                  <Select.Option key={outlet._id} value={outlet._id}>
                    {outlet.name} ({outlet.outletId})
                  </Select.Option>
                ))
              : warehousesData?.data?.map((warehouse) => (
                  <Select.Option key={warehouse._id} value={warehouse.warehouseId}>
                    {warehouse.name} ({warehouse.warehouseId})
                  </Select.Option>
                ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="mrp"
          label="MRP (Maximum Retail Price)"
          rules={[
            { required: true, message: "Please enter MRP" },
            { type: "number", min: 0, message: "MRP must be positive" },
          ]}
        >
          <Input type="number" step="0.01" placeholder="Enter MRP" />
        </Form.Item>

        <Form.Item
          name="tp"
          label="TP (Trade Price)"
          rules={[
            { required: true, message: "Please enter TP" },
            { type: "number", min: 0, message: "TP must be positive" },
          ]}
        >
          <Input type="number" step="0.01" placeholder="Enter TP" />
        </Form.Item>

        <Form.Item
          name="units"
          label="Units"
          rules={[
            { required: true, message: "Please enter units" },
            { type: "number", min: 1, message: "Units must be at least 1" },
          ]}
        >
          <Input type="number" placeholder="Enter number of units" />
        </Form.Item>

        <Form.Item
          name="expireDate"
          label="Expire Date"
          rules={[{ required: true, message: "Please select expire date" }]}
        >
                   <DatePicker
           style={{ width: "100%" }}
           placeholder="Select expire date"
         />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddStockDrawer; 