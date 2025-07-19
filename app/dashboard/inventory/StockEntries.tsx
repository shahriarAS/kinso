import { Form, FormInstance, Input, Select, Button } from "antd";
import { Icon } from "@iconify/react";

type Props = {
  form: FormInstance;
  warehouseOptions?: { label: string; value: string; }[];
};

export default function StockEntries({ form, warehouseOptions = [] }: Props) {
  return (
    <div>
      <label className="block text-base font-semibold mb-2">
        Stock Entries
      </label>
      <Form form={form}>
        <Form.List name="stock">
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-3">
            {fields.map((field) => (
              <div
                key={field.key}
                className="border border-gray-200 rounded-lg p-4 relative"
              >
                <div className="grid grid-cols-4 gap-x-4">
                  <Form.Item
                    name={[field.name, "warehouse"]}
                    label="Warehouse"
                    rules={[{ required: true, message: "Select warehouse" }]}
                    className="font-medium"
                  >
                    <Select
                      size="large"
                      placeholder="Select Warehouse"
                      options={warehouseOptions}
                      className="w-full"
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "unit"]}
                    label="Unit"
                    rules={[{ required: true, message: "Enter unit" }]}
                    className="font-medium"
                  >
                    <Input
                      type="number"
                      size="large"
                      placeholder="Unit"
                      min={0}
                      className="w-full"
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "dp"]}
                    label="DP"
                    rules={[{ required: true, message: "Enter DP" }]}
                    className="font-medium"
                  >
                    <Input
                      type="number"
                      size="large"
                      placeholder="DP"
                      min={0}
                      className="w-full"
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, "mrp"]}
                    label="MRP"
                    rules={[{ required: true, message: "Enter MRP" }]}
                    className="font-medium"
                  >
                    <Input
                      type="number"
                      size="large"
                      placeholder="MRP"
                      min={0}
                      className="w-full"
                    />
                  </Form.Item>
                </div>
                <Button
                  type="link"
                  danger
                  className="absolute top-2 right-2"
                  onClick={() => remove(field.name)}
                  icon={<Icon icon="lineicons:close" />}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<Icon icon="lineicons:plus" />}
            >
              Add Stock
            </Button>
          </div>
        )}
        </Form.List>
      </Form>
    </div>
  );
}
