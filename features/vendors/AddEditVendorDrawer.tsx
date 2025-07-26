import React, { useEffect } from "react";
import { Drawer, Form, Input, Button, message } from "antd";
import { useCreateVendorMutation, useUpdateVendorMutation } from "./api";
import { Vendor, ICreateVendorRequest, IUpdateVendorRequest } from "./types";
import { useNotification } from "@/hooks/useNotification";

interface AddEditVendorDrawerProps {
  open: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
}

const AddEditVendorDrawer: React.FC<AddEditVendorDrawerProps> = ({
  open,
  onClose,
  vendor,
}) => {
  const [form] = Form.useForm();
  const { success, error } = useNotification();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const isEditing = !!vendor;

  useEffect(() => {
    if (open) {
      if (vendor) {
        form.setFieldsValue({
          vendorId: vendor.vendorId,
          vendorName: vendor.vendorName,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, vendor, form]);

  const handleSubmit = async (values: ICreateVendorRequest | IUpdateVendorRequest) => {
    try {
      if (isEditing && vendor) {
        await updateVendor({
          _id: vendor._id,
          vendor: values as IUpdateVendorRequest,
        }).unwrap();
        success("Vendor updated successfully");
      } else {
        await createVendor(values as ICreateVendorRequest).unwrap();
        success("Vendor created successfully");
      }
      onClose();
      form.resetFields();
    } catch (err) {
      error("Failed to save vendor");
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title={isEditing ? "Edit Vendor" : "Add Vendor"}
      width={500}
      open={open}
      onClose={handleClose}
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isCreating || isUpdating}
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
          name="vendorId"
          label="Vendor ID"
          rules={[
            { required: true, message: "Please enter vendor ID" },
            { min: 2, message: "Vendor ID must be at least 2 characters" },
          ]}
        >
          <Input placeholder="Enter vendor ID" />
        </Form.Item>

        <Form.Item
          name="vendorName"
          label="Vendor Name"
          rules={[
            { required: true, message: "Please enter vendor name" },
            { min: 2, message: "Vendor name must be at least 2 characters" },
          ]}
        >
          <Input placeholder="Enter vendor name" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddEditVendorDrawer; 