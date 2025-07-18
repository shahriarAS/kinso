"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Form, Input } from "antd";
import { useState } from "react";
import { Warehouse } from "@/types";

type Props = {};

export default function AddEditWarehouseDrawer({}: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<Warehouse>();

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} size="large" type="primary">
        <Icon icon="mdi:plus" />
        Add Warehouse
      </Button>
      <Drawer
        title="Add New Warehouse"
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
          name="warehouse-add"
          layout="vertical"
          requiredMark={false}
          className="border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
        >
          <Form.Item
            name="name"
            label="Warehouse Name"
            rules={[{ required: true, message: "Please enter warehouse name" }]}
            className="font-medium"
          >
            <Input
              size="large"
              placeholder="Enter Warehouse Name"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: "Please enter location" }]}
            className="font-medium"
          >
            <Input
              size="large"
              placeholder="Enter Location"
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
} 