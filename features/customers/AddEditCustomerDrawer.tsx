"use client";
import { Icon } from "@iconify/react";
import { Button, Drawer, Form, Input, Select, Spin } from "antd";
import { useEffect } from "react";
import { CustomerInput, Customer } from "./types";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "./api";
import { useNotification } from "@/hooks/useNotification";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  customer?: Customer | null;
  onSuccess?: () => void;
}

export default function AddEditCustomerDrawer({
  open,
  setOpen,
  customer,
  onSuccess,
}: Props) {
  const [form] = Form.useForm<CustomerInput>();
  const isEditing = !!customer;

  const [createCustomer, { isLoading: isCreating }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] =
    useUpdateCustomerMutation();
  const { success, error: showError } = useNotification();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (customer && open) {
      form.setFieldsValue({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        notes: customer.notes,
      });
    }
  }, [customer, open, form]);

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    onSuccess?.();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditing && customer) {
        await updateCustomer({ _id: customer._id, customer: values }).unwrap();
        success("Customer updated successfully");
      } else {
        await createCustomer(values).unwrap();
        success("Customer created successfully");
      }

      onClose();
    } catch (err: unknown) {
      const error = err as {
        data?: { message?: string };
        errorFields?: unknown;
      };
      if (error?.data?.message) {
        showError("Failed to save customer", error.data.message);
      } else if (!error?.errorFields) {
        // Only show error if it's not a form validation error
        showError("Failed to save customer", "An unexpected error occurred");
      }
    }
  };

  return (
    <div>
      <Drawer
        title={isEditing ? "Edit Customer" : "Add New Customer"}
        open={open}
        onClose={onClose}
        width={480}
        className="rounded-3xl"
        getContainer={false}
        destroyOnHidden={true}
        closeIcon={<Icon icon="lineicons:close" className="font-extrabold" />}
        extra={
          <div className="flex gap-4 justify-end">
            <Button type="default" onClick={onClose} disabled={isLoading}>
              Discard
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isLoading}
              icon={isLoading ? <Spin size="small" /> : undefined}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          name="customer-form"
          layout="vertical"
          requiredMark={false}
          className="border border-gray-200 shadow-sm rounded-xl p-4 pb-6"
          disabled={isLoading}
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
                { type: "email", message: "Please enter a valid email" },
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

          <Form.Item name="notes" label="Notes" className="font-medium">
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