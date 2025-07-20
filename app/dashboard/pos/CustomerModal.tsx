"use client";
import { Modal, Form, Input, Button, Select, message } from "antd";
import { useCreateCustomerMutation } from "@/features/customers";
import type { CustomerInput } from "@/features/customers";

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: {
    _id: string;
    name: string;
    value: string;
  }) => void;
}

export default function CustomerModal({
  open,
  onClose,
  onCustomerCreated,
}: CustomerModalProps) {
  const [form] = Form.useForm();
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const handleSubmit = async (values: CustomerInput) => {
    try {
      const result = await createCustomer(values).unwrap();
      message.success("Customer created successfully!");
      onCustomerCreated({
        _id: result.data._id,
        name: result.data.name,
        value: result.data._id,
      });
      form.resetFields();
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      message.error(error.data?.message || "Failed to create customer");
    }
  };

  return (
    <Modal
      title="Create New Customer"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: "active" }}
      >
        <Form.Item
          name="name"
          label="Customer Name"
          rules={[{ required: true, message: "Please enter customer name" }]}
        >
          <Input placeholder="Enter customer name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Phone"
          rules={[{ required: true, message: "Please enter phone number" }]}
        >
          <Input placeholder="Enter phone number" />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Enter any additional notes" />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex gap-2 justify-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Create Customer
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
