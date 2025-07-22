import React from "react";
import { Form, InputNumber, Select, Row, Col, FormInstance } from "antd";

const WARRANTY_UNITS = [
  { label: "Days", value: "days" },
  { label: "Months", value: "months" },
  { label: "Years", value: "years" },
];

interface WarrantyValue {
  value?: number;
  unit: string;
}

type WarrantyFieldValue = number | string | undefined;

interface WarrantyInputProps {
  form: FormInstance;
}

export default function WarrantyInput({ form }: WarrantyInputProps) {
  const value: WarrantyValue = Form.useWatch("warranty", form) || {};
  const effectiveValue = value.value;
  const effectiveUnit = value.value === undefined ? undefined : (value.unit || "months");

  const handleChange = (field: keyof WarrantyValue, val: WarrantyFieldValue) => {
    form.setFieldsValue({ warranty: { ...value, [field]: val } });
  };

  return (
    <>
      <Row gutter={8}>
        <Col span={16}>
          <Form.Item
            name={["warranty", "value"]}
            noStyle
            rules={[{ required: false, type: "number", min: 0, message: "Enter warranty duration" }]}
          >
            <InputNumber
              min={0}
              placeholder="Enter duration"
              style={{ width: "100%" }}
              value={effectiveValue === undefined ? null : effectiveValue}
              onChange={(val) => {
                if (typeof val === "number") {
                  handleChange("value", val);
                } else {
                  handleChange("value", undefined);
                  handleChange("unit", undefined);
                }
              }}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={["warranty", "unit"]} noStyle>
            <Select
              options={WARRANTY_UNITS}
              value={effectiveUnit}
              onChange={(val) => handleChange("unit", val as string)}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
      </Row>
      <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
        Leave blank to clear warranty.
      </div>
    </>
  );
} 