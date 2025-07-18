"use client";
import { Icon } from "@iconify/react";
import { Button, Divider, Drawer, Form, Input } from "antd";
import { useState } from "react";
import { Category } from "@/types";

type Props = {};

export default function AddEditCategoryDrawer({}: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<Category>();

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} size="large" type="primary">
        <Icon icon="mdi:plus" />
        Add Category
      </Button>
      <Drawer
        title="Add New Category"
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
          name="category-add"
          layout="vertical"
          requiredMark={false}
          className="border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
            className="font-medium"
          >
            <Input
              size="large"
              placeholder="Enter Category Name"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            className="font-medium"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter Description"
              className="w-full"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
} 