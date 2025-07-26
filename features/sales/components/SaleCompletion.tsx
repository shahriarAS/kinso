"use client";

import React, { useState } from "react";
import { Form, Select, Input, Button, Card, Typography, Space, Divider } from "antd";
import { UserOutlined, CreditCardOutlined, DollarOutlined } from "@ant-design/icons";
import type { CartItem } from "../types";
import type { Customer } from "@/features/customers";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface SaleCompletionProps {
  cart: CartItem[];
  customers: Customer[];
  outlets: { _id: string; name: string }[];
  selectedOutlet: string;
  onSaleComplete: (saleData: {
    outletId: string;
    customerId?: string;
    paymentMethod: string;
    notes?: string;
  }) => void;
  loading?: boolean;
}

const SaleCompletion: React.FC<SaleCompletionProps> = ({
  cart,
  customers,
  outlets,
  selectedOutlet,
  onSaleComplete,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discountApplied, 0);
  const finalTotal = subtotal - totalDiscount;

  const handleSubmit = (values: any) => {
    onSaleComplete({
      outletId: selectedOutlet,
      customerId: values.customerId || undefined,
      paymentMethod: values.paymentMethod,
      notes: values.notes,
    });
  };

  const paymentMethods = [
    { value: "CASH", label: "Cash", icon: <DollarOutlined /> },
    { value: "BKASH", label: "bKash", icon: <CreditCardOutlined /> },
    { value: "ROCKET", label: "Rocket", icon: <CreditCardOutlined /> },
    { value: "NAGAD", label: "Nagad", icon: <CreditCardOutlined /> },
    { value: "BANK", label: "Bank Transfer", icon: <CreditCardOutlined /> },
    { value: "CARD", label: "Card", icon: <CreditCardOutlined /> },
  ];

  return (
    <Card title="Complete Sale" className="h-full">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              paymentMethod: "CASH",
            }}
          >
            {/* Outlet Selection */}
            <Form.Item label="Outlet">
              <Select
                value={selectedOutlet}
                disabled
                className="w-full"
              >
                {outlets.map((outlet) => (
                  <Option key={outlet._id} value={outlet._id}>
                    {outlet.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Customer Selection */}
            <Form.Item label="Customer" name="customerId">
              <Select
                placeholder="Select customer (optional)"
                allowClear
                showSearch
                optionFilterProp="children"
                className="w-full"
                onChange={setSelectedCustomer}
              >
                <Option value="">Anonymous Customer</Option>
                {customers.map((customer) => (
                  <Option key={customer._id} value={customer._id}>
                    <Space>
                      <UserOutlined />
                      {customer.name} - {customer.phone}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Payment Method */}
            <Form.Item
              label="Payment Method"
              name="paymentMethod"
              rules={[{ required: true, message: "Please select payment method" }]}
            >
              <Select className="w-full">
                {paymentMethods.map((method) => (
                  <Option key={method.value} value={method.value}>
                    <Space>
                      {method.icon}
                      {method.label}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Notes */}
            <Form.Item label="Notes" name="notes">
              <TextArea
                rows={3}
                placeholder="Add any additional notes..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>

          <Divider />

          {/* Sale Summary */}
          <div className="space-y-2">
            <Title level={5}>Sale Summary</Title>
            <div className="space-y-1">
              <div className="flex justify-between">
                <Text>Items:</Text>
                <Text>{cart.length}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Subtotal:</Text>
                <Text>৳{subtotal.toFixed(2)}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Total Discount:</Text>
                <Text type="danger">-৳{totalDiscount.toFixed(2)}</Text>
              </div>
              <Divider style={{ margin: "8px 0" }} />
              <div className="flex justify-between">
                <Title level={4} style={{ margin: 0 }}>Total Amount:</Title>
                <Title level={4} style={{ margin: 0 }}>৳{finalTotal.toFixed(2)}</Title>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Sale Button */}
        <div className="mt-4">
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            onClick={() => form.submit()}
            loading={loading}
            disabled={cart.length === 0}
            className="w-full"
            style={{ height: 48 }}
          >
            Complete Sale - ৳{finalTotal.toFixed(2)}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SaleCompletion; 