import React, { useState } from "react";
import { Drawer, Form, Input, Select, Button, message } from "antd";
import { useMoveStockMutation } from "../api";
import { useGetOutletsQuery } from "@/features/outlets/api";
import { useGetWarehousesQuery } from "@/features/warehouses/api";
import { StockMoveInput, Stock } from "../types";

interface MoveStockDrawerProps {
  open: boolean;
  onClose: () => void;
  stock: Stock | null;
}

const MoveStockDrawer: React.FC<MoveStockDrawerProps> = ({ open, onClose, stock }) => {
  const [form] = Form.useForm();
  const [locationType, setLocationType] = useState<"warehouse" | "outlet">("outlet");
  const [moveStock, { isLoading }] = useMoveStockMutation();

  const { data: outletsData } = useGetOutletsQuery({ limit: 1000 });
  const { data: warehousesData } = useGetWarehousesQuery({ limit: 1000 });

  const handleSubmit = async (values: any) => {
    if (!stock) return;

    try {
      const moveData: StockMoveInput = {
        stockId: stock._id,
        units: parseInt(values.units),
        ...(locationType === "outlet" && { targetOutletId: values.targetLocationId }),
        ...(locationType === "warehouse" && { targetWarehouseId: values.targetLocationId }),
      };

      await moveStock(moveData).unwrap();
      message.success("Stock moved successfully");
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error?.data?.message || "Failed to move stock");
    }
  };

  const handleLocationTypeChange = (value: "warehouse" | "outlet") => {
    setLocationType(value);
    form.setFieldsValue({ targetLocationId: undefined });
  };

  const maxUnits = stock?.units || 0;

  return (
    <Drawer
      title="Move Stock"
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
            Move Stock
          </Button>
        </div>
      }
    >
      {stock && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Stock Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Product:</span>
              <p className="font-medium">{stock.product?.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Current Location:</span>
              <p className="font-medium">
                {stock.outlet?.name || stock.warehouse?.name}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Available Units:</span>
              <p className="font-medium">{stock.units}</p>
            </div>
            <div>
              <span className="text-gray-600">Expire Date:</span>
              <p className="font-medium">
                {new Date(stock.expireDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          locationType: "outlet",
        }}
      >
        <Form.Item
          name="locationType"
          label="Target Location Type"
          rules={[{ required: true, message: "Please select target location type" }]}
        >
          <Select onChange={handleLocationTypeChange}>
            <Select.Option value="outlet">Outlet</Select.Option>
            <Select.Option value="warehouse">Warehouse</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="targetLocationId"
          label={`Target ${locationType === "warehouse" ? "Warehouse" : "Outlet"}`}
          rules={[{ required: true, message: `Please select target ${locationType}` }]}
        >
          <Select
            placeholder={`Select target ${locationType}`}
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
          name="units"
          label="Units to Move"
          rules={[
            { required: true, message: "Please enter units to move" },
            { type: "number", min: 1, message: "Units must be at least 1" },
            {
              validator: (_, value) => {
                if (value > maxUnits) {
                  return Promise.reject(new Error(`Cannot move more than ${maxUnits} units`));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            placeholder={`Enter units (max: ${maxUnits})`}
            max={maxUnits}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default MoveStockDrawer; 