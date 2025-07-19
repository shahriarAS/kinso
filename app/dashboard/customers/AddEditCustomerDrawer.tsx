"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Form, Input, Select } from "antd";
import { useState } from "react";
import { CustomerInput } from "@/types/customer";

type Props = {};

export default function AddEditCustomerDrawer({}: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CustomerInput>();

  const onClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setOpen(true)} size="large" type="primary">
        <Icon icon="mdi:plus" />
        Add Customer
      </Button>
      <Drawer
        title="Add New Customer"
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
          name="customer-add"
          layout="vertical"
          requiredMark={false}
          className="border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter customer name" }]}
            className="font-medium"
          >
            <Input
              size="large"
              placeholder="Enter Full Name"
              className="w-full"
            />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-6">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter a valid email" }
              ]}
              className="font-medium"
            >
              <Input
                size="large"
                placeholder="Enter Email"
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
              className="font-medium"
            >
              <Input
                size="large"
                placeholder="Enter Phone"
                className="w-full"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please enter address" }]}
            className="font-medium"
          >
            <Input.TextArea
              rows={2}
              placeholder="Enter Address"
              className="w-full"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-6">
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: "Please enter city" }]}
              className="font-medium"
            >
              <Input
                size="large"
                placeholder="Enter City"
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: "Please enter state" }]}
              className="font-medium"
            >
              <Input
                size="large"
                placeholder="Enter State"
                className="w-full"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Form.Item
              name="zipCode"
              label="Zip Code"
              rules={[{ required: true, message: "Please enter zip code" }]}
              className="font-medium"
            >
              <Input
                size="large"
                placeholder="Enter Zip Code"
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please enter country" }]}
              className="font-medium"
            >
              <Input
                size="large"
                placeholder="Enter Country"
                className="w-full"
              />
            </Form.Item>
          </div>

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
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
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