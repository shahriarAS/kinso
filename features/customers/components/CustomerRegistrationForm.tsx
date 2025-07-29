import React from "react";
import { Form, Input, InputNumber, Switch, Button, Card, Space, message } from "antd";
import { UserAddOutlined, SaveOutlined } from "@ant-design/icons";
import { CustomerInput } from "../types";
import { useCreateCustomerMutation } from "../api";
import toast from "react-hot-toast";

interface CustomerRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CustomerRegistrationForm: React.FC<CustomerRegistrationFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const handleSubmit = async (values: CustomerInput) => {
    try {
      await createCustomer(values).unwrap();
      toast.success("Customer registered successfully!");
      form.resetFields();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to register customer");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  return (
    <Card
      title={
        <Space>
          <UserAddOutlined />
          Customer Registration
        </Space>
      }
      className="w-full max-w-2xl mx-auto"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          membershipStatus: false,
          purchaseAmount: 0,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Customer ID"
            name="customer"
            rules={[
              { required: true, message: "Please enter customer ID" },
              { min: 3, message: "Customer ID must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter customer ID" />
          </Form.Item>

          <Form.Item
            label="Customer Name"
            name="customerName"
            rules={[
              { required: true, message: "Please enter customer name" },
              { min: 2, message: "Customer name must be at least 2 characters" },
            ]}
          >
            <Input placeholder="Enter customer name" />
          </Form.Item>
        </div>

        <Form.Item
          label="Contact Information"
          name="contactInfo"
          rules={[
            { required: true, message: "Please enter contact information" },
            { min: 5, message: "Contact information must be at least 5 characters" },
          ]}
        >
          <Input.TextArea
            placeholder="Enter email, phone, or address"
            rows={3}
          />
        </Form.Item>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Purchase Amount"
            name="purchaseAmount"
            rules={[
              { required: true, message: "Please enter purchase amount" },
              { type: "number", min: 0, message: "Purchase amount must be positive" },
            ]}
          >
            <InputNumber
              placeholder="0.00"
              min={0}
              step={0.01}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            label="Membership Status"
            name="membershipStatus"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Member"
              unCheckedChildren="Non-Member"
            />
          </Form.Item>
        </div>

        <Form.Item className="mb-0">
          <Space className="w-full justify-end">
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<SaveOutlined />}
            >
              Register Customer
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CustomerRegistrationForm; 