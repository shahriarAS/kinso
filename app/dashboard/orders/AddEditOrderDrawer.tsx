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