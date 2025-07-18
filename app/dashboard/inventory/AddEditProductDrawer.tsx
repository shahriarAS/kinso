"use client";
import { Icon } from "@iconify/react";
import { Button, Divider, Drawer, Form, Input, Select } from "antd";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { ProductInput } from "@/types";
import DummyChatBox from "./DummyChatBox";
import StockEntries from "./StockEntries";

type Props = {};

export default function AddEditProductDrawer({}: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<ProductInput>();

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} size="large" type="primary">
        <Icon icon="mdi:plus" />
        Add Product
      </Button>
      <Drawer
        title="Add New Product"
        open={open}
        onClose={onClose}
        width={"100%"}
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
        <div className="flex gap-6">
          <Form
            form={form}
            name="product-add"
            layout="vertical"
            requiredMark={false}
            className="w-2/3 border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
          >
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: "Please enter product name" }]}
              className="font-medium"
            >
              <Input
                size="large"
                placeholder="Enter Product Name"
                className="w-full"
              />
            </Form.Item>
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="upc"
                label="UPC"
                rules={[{ required: true, message: "Please enter UPC" }]}
                className="font-medium"
              >
                <Input
                  size="large"
                  placeholder="Enter UPC"
                  className="w-full"
                />
              </Form.Item>
              <Form.Item
                name="category"
                label="Category"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
                className="font-medium"
              >
                <Select
                  size="large"
                  placeholder="Select Category"
                  options={[
                    { label: "Electronics", value: "electronics" },
                    { label: "Clothing", value: "clothing" },
                    { label: "Food", value: "food" },
                  ]}
                  className="w-full"
                />
              </Form.Item>
            </div>

            <Divider />

            {/* Stock List Section */}
            <StockEntries form={form} />
          </Form>
          <DummyChatBox />
        </div>
      </Drawer>
    </div>
  );
}
