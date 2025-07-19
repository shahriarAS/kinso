"use client";
import { Icon } from "@iconify/react";
import { Button, Divider, Drawer, Form, Input, Select, DatePicker } from "antd";
import { useState } from "react";
import { OrderInput } from "@/types/order";

type Props = {};

export default function AddEditOrderDrawer({}: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<OrderInput>();

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} size="large" type="primary">
        <Icon icon="mdi:plus" />
        Add Order
      </Button>
      <Drawer
        title="Add New Order"
        open={open}
        onClose={onClose}
        width={480}
        className="rounded-3xl"
        getContainer={false}
        destroyOnHidden={true}
        closeIcon={<Icon icon="lineicons:close" className="font-extrabold" />}
        extra={
          <div className="flex gap-4 justify-end">
            <Button type="default" onClick={onClose}>
              Discard
            </Button>
            <Button type="primary" onClick={onClose}>
              Save
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          name="order-add"
          layout="vertical"
          requiredMark={false}
          className="border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
        >
          <Form.Item
            name="customerId"
            label="Customer"
            rules={[{ required: true, message: "Please select a customer" }]}
            className="font-medium"
          >
            <Select
              size="large"
              placeholder="Select Customer"
              options={[
                { label: "John Doe", value: "CUST-001" },
                { label: "Jane Smith", value: "CUST-002" },
                { label: "Bob Johnson", value: "CUST-003" },
              ]}
              className="w-full"
            />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-6">
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
              className="font-medium"
            >
              <Select
                size="large"
                placeholder="Select Status"
                options={[
                  { label: "Pending", value: "pending" },
                  { label: "Processing", value: "processing" },
                  { label: "Shipped", value: "shipped" },
                  { label: "Delivered", value: "delivered" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="paymentStatus"
              label="Payment Status"
              rules={[{ required: true, message: "Please select payment status" }]}
              className="font-medium"
            >
              <Select
                size="large"
                placeholder="Select Payment Status"
                options={[
                  { label: "Pending", value: "pending" },
                  { label: "Paid", value: "paid" },
                  { label: "Failed", value: "failed" },
                ]}
                className="w-full"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="shippingAddress"
            label="Shipping Address"
            rules={[{ required: true, message: "Please enter shipping address" }]}
            className="font-medium"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter Shipping Address"
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
            className="font-medium"
          >
            <Input.TextArea
              rows={2}
              placeholder="Enter Notes"
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
} 