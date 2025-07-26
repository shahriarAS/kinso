import React, { useEffect } from "react";
import { Drawer, Form, Input, Button, message } from "antd";
import { Outlet, OutletInput } from "./types";
import { useCreateOutletMutation, useUpdateOutletMutation } from "./api";
import { useNotification } from "@/hooks/useNotification";

interface AddEditOutletDrawerProps {
  visible: boolean;
  onClose: () => void;
  outlet?: Outlet | null;
  onSuccess?: () => void;
}

const AddEditOutletDrawer: React.FC<AddEditOutletDrawerProps> = ({
  visible,
  onClose,
  outlet,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { success, error: showError } = useNotification();
  const [createOutlet, { isLoading: isCreating }] = useCreateOutletMutation();
  const [updateOutlet, { isLoading: isUpdating }] = useUpdateOutletMutation();

  const isEditing = !!outlet;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (visible && outlet) {
      form.setFieldsValue({
        outletId: outlet.outletId,
        name: outlet.name,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, outlet, form]);

  const handleSubmit = async (values: OutletInput) => {
    try {
      if (isEditing && outlet) {
        await updateOutlet({
          _id: outlet._id,
          outlet: values,
        }).unwrap();
        success("Outlet updated successfully");
      } else {
        await createOutlet(values).unwrap();
        success("Outlet created successfully");
      }
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Operation failed";
      showError(errorMessage);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={isEditing ? "Edit Outlet" : "Add New Outlet"}
      width={500}
      open={visible}
      onClose={handleClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isLoading}
            onClick={() => form.submit()}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="Outlet ID"
          name="outletId"
          rules={[
            { required: true, message: "Please enter outlet ID" },
            { min: 2, message: "Outlet ID must be at least 2 characters" },
            { max: 20, message: "Outlet ID must not exceed 20 characters" },
            {
              pattern: /^[A-Z0-9]+$/,
              message: "Outlet ID must contain only uppercase letters and numbers",
            },
          ]}
        >
          <Input
            placeholder="e.g., OUT001"
            disabled={isEditing}
            className="uppercase"
          />
        </Form.Item>

        <Form.Item
          label="Outlet Name"
          name="name"
          rules={[
            { required: true, message: "Please enter outlet name" },
            { min: 2, message: "Name must be at least 2 characters" },
            { max: 100, message: "Name must not exceed 100 characters" },
          ]}
        >
          <Input placeholder="Enter outlet name" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddEditOutletDrawer; 